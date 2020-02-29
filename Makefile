# AWS
AWS_PROFILE ?= default

# Packages
UI=./ui

# Source directories
UI_SRC_DIR=$(UI)/src

# Output directories
UI_OUT_DIR=$(UI)/dist
UI_NEXT_OUT_DIR=$(UI)/src/.next

# Source files
## Find `package.json` files everywhere except `node_modules`
PACKAGE_JSON := $(shell find . -maxdepth 2 -name 'package.json' -and -not -path './node_modules/*')
## Find .ts and .tsx files separately
UI_TS_SRC := $(shell find -E $(UI_SRC_DIR) -not -path '$(UI_SRC_DIR)/.next/*' -regex '.*\.ts' -not -name '*.d.ts')
UI_TSX_SRC := $(shell find -E $(UI_SRC_DIR) -not -path '$(UI_SRC_DIR)/.next/*' -regex '.*\.tsx' -not -name '*.d.ts')
UI_SRC := $(UI_TS_SRC) $(UI_TSX_SRC)

# Output files
## Replace file suffixes keeping src path
UI_SRC_OUT := $(UI_TS_SRC:.ts=.js) $(UI_TS_SRC:.ts=.js.map) $(UI_TSX_SRC:.tsx=.js) $(UI_TSX_SRC:.tsx=.js.map)
## Replace src path with out path
UI_OUT := $(subst $(UI_SRC_DIR), $(UI_OUT_DIR), $(UI_SRC_OUT))
## Use the build id as the only mapped result of a NextJS build
UI_NEXT_OUT := $(UI_NEXT_OUT_DIR)/BUILD_ID

.PHONY: all clean ui

all: ui

ui: $(UI_NEXT_OUT)

$(UI)/.env: $(UI)/.env.sample
	aws --profile=$(AWS_PROFILE) ssm get-parameters-by-path --with-decryption --path /mines/dev/ui --recursive \
		| jq --raw-output '.Parameters[] | (.Name | sub("[a-z/]+/"; "")) + ("=") + (.Value)' \
		> $@

$(UI_NEXT_OUT): node_modules $(UI)/.env $(UI_SRC)
	yarn workspace @mines/ui build

node_modules: $(PACKAGE_JSON) yarn.lock
	yarn install
	@touch -mr $(shell ls -Atd $? | head -1) $@

clean:
	rm -rf \
		$(UI_NEXT_OUT_DIR)

print-%:
	@echo '$*=$($*)'
