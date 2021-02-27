# AWS
AWS_PROFILE ?= default

PWD = $(shell dirname $(realpath $(firstword $(MAKEFILE_LIST))))

# Packages
NEST=./server-nest
UI=./ui
UI_RS=./ui-rs

# Source directories
NEST_SRC_DIR=$(NEST)/src
UI_SRC_DIR=$(UI)/src
UI_RS_SRC_DIR=$(UI_RS)/src
UI_RS_CRATE_SRC_DIR=$(UI_RS)/crates

# Output directories
NEST_OUT_DIR=$(NEST)/dist
UI_OUT_DIR=$(UI)/dist
UI_NEXT_OUT_DIR=$(UI)/src/.next
UI_RS_OUT_DIR=$(UI_RS)/dist
UI_RS_WASM_OUT_DIR=$(UI_RS)/src/crate

# Source files
## Find `package.json` files everywhere except `node_modules`
CARGO_TOML := $(shell find . -name 'Cargo.toml')
PACKAGE_JSON := $(shell find . -maxdepth 2 -name 'package.json' -and -not -path './node_modules/*')
## Find .ts files for nest server
NEST_SRC := $(shell find -E $(NEST_SRC_DIR) -regex '.*\.ts' -not -name '*.d.ts' -not -name '*.spec.ts')
## Find .ts and .tsx files separately
UI_TS_SRC := $(shell find -E $(UI_SRC_DIR) -not -path '$(UI_SRC_DIR)/.next/*' -regex '.*\.ts' -not -name '*.d.ts')
UI_TSX_SRC := $(shell find -E $(UI_SRC_DIR) -not -path '$(UI_SRC_DIR)/.next/*' -regex '.*\.tsx' -not -name '*.d.ts')
UI_SRC := $(UI_TS_SRC) $(UI_TSX_SRC)
## Find .rs and .ts files separately
UI_RS_MOGWAI_SRC := $(shell find -E $(UI_RS_CRATE_SRC_DIR)/mines_mogwai -regex '.*\.rs')
UI_RS_YEW_SRC := $(shell find -E $(UI_RS_CRATE_SRC_DIR)/mines_uirs -regex '.*\.rs')
UI_RS_RUST_SRC := $(UI_RS_MOGWAI_SRC) $(UI_RS_YEW_SRC)
UI_RS_TS_SRC := $(shell find -E $(UI_RS_SRC_DIR) -regex '.*\.ts' -not -name '*.d.ts' -not -name '*.spec.ts')
UI_RS_SRC := $(UI_RS_RUST_SRC) $(UI_RS_TS_SRC) $(UI_RS_SRC_DIR)/index.ejs

# Output files
## Replace file suffixes keeping src path
NEST_SRC_OUT := $(NEST_SRC:.ts=.js) $(NEST_SRC:.ts=.js.map) $(NEST_SRC:.ts=.d.ts)
UI_SRC_OUT := $(UI_TS_SRC:.ts=.js) $(UI_TS_SRC:.ts=.js.map) $(UI_TSX_SRC:.tsx=.js) $(UI_TSX_SRC:.tsx=.js.map)
## Replace src path with out path
NEST_OUT := $(subst $(NEST_SRC_DIR), $(NEST_OUT_DIR), $(NEST_SRC_OUT))
UI_OUT := $(subst $(UI_SRC_DIR), $(UI_OUT_DIR), $(UI_SRC_OUT))
## Use the build id as the only mapped result of a NextJS build
UI_NEXT_OUT := $(UI_NEXT_OUT_DIR)/BUILD_ID
## Use the index file as the only mapped result of the webassembly SPA
UI_RS_MOGWAI_OUT := $(UI_RS_WASM_OUT_DIR)/mines_mogwai/index_bg.wasm
UI_RS_YEW_OUT := $(UI_RS_WASM_OUT_DIR)/mines_uirs/index_bg.wasm
UI_RS_OUT := $(UI_RS_OUT_DIR)/index.html

.PHONY: all clean init nest ui uirs wasm

all: init nest ui uirs

init: .git/config

nest: $(NEST_OUT)

ui: $(UI_NEXT_OUT)

uirs: $(UI_RS_OUT)

wasm: $(UI_RS_MOGWAI_OUT) $(UI_RS_YEW_OUT)

.git/config: .githooks/*
	git config core.hooksPath .githooks

.env: .env.sample
	aws --profile=$(AWS_PROFILE) ssm get-parameters-by-path --with-decryption --path /mines/dev --recursive \
		| jq --raw-output '.Parameters[] | (.Name | sub("[a-z/]+/"; "")) + ("=\"") + (.Value) + ("\"")' \
		> $@

$(NEST)/.env: .env
	cp $? $@

$(NEST_OUT): node_modules $(NEST)/.env $(NEST_SRC)
	@# Remove files from `NEST_OUT` that don't correspond to source files
	@rm -rf $(filter-out $(NEST_OUT), $(wildcard $(NEST_OUT_DIR)/*.* $(NEST_OUT_DIR)/*/*.*))
	yarn workspace @mines/nest build

$(UI)/.env: .env
	cp $? $@

$(UI_NEXT_OUT): node_modules $(UI)/.env $(UI_SRC)
	yarn workspace @mines/ui build

Cargo.lock: $(CARGO_TOML) init
	cargo check --release --workspace

$(UI_RS_MOGWAI_OUT): .env $(UI_RS_MOGWAI_SRC)
	wasm-pack build \
		--release \
		--out-name=index \
		--out-dir=$(PWD)/$(UI_RS_WASM_OUT_DIR)/mines_mogwai/ \
		$(UI_RS_CRATE_SRC_DIR)/mines_mogwai

$(UI_RS_YEW_OUT): .env $(UI_RS_YEW_SRC)
	wasm-pack build \
		--release \
		--out-name=index \
		--out-dir=$(PWD)/$(UI_RS_WASM_OUT_DIR)/mines_uirs/ \
		$(UI_RS_CRATE_SRC_DIR)/mines_uirs

$(UI_RS_OUT): node_modules .env $(UI_RS_SRC) $(UI_RS_MOGWAI_OUT) $(UI_RS_YEW_OUT)
	yarn workspace @mines/uirs build

node_modules: $(PACKAGE_JSON) yarn.lock init
	yarn install
	@touch -mr $(shell ls -Atd $? | head -1) $@

clean:
	rm -rf \
		$(NEST_OUT_DIR) \
		$(NEST_OUT_DIR) \
		$(UI_RS_OUT_DIR) \
		$(UI_RS_WASM_OUT_DIR) \
		$(UI_NEXT_OUT_DIR)

print-%:
	@echo '$*=$($*)'
