# AWS
AWS_PROFILE ?= default

# Packages
NEST=./server-nest
UI=./ui

# Source directories
NEST_SRC_DIR=$(NEST)/src
UI_SRC_DIR=$(UI)/src

# Output directories
NEST_OUT_DIR=$(NEST)/dist
UI_OUT_DIR=$(UI)/dist
UI_NEXT_OUT_DIR=$(UI)/src/.next

# Source files
## Find `package.json` files everywhere except `node_modules`
PACKAGE_JSON := $(shell find . -maxdepth 2 -name 'package.json' -and -not -path './node_modules/*')
## Find .ts files for nest server
NEST_SRC := $(shell find -E $(NEST_SRC_DIR) -regex '.*\.ts' -not -name '*.d.ts' -not -name '*.spec.ts')
## Find .ts and .tsx files separately
UI_TS_SRC := $(shell find -E $(UI_SRC_DIR) -not -path '$(UI_SRC_DIR)/.next/*' -regex '.*\.ts' -not -name '*.d.ts')
UI_TSX_SRC := $(shell find -E $(UI_SRC_DIR) -not -path '$(UI_SRC_DIR)/.next/*' -regex '.*\.tsx' -not -name '*.d.ts')
UI_SRC := $(UI_TS_SRC) $(UI_TSX_SRC)

# Output files
## Replace file suffixes keeping src path
NEST_SRC_OUT := $(NEST_SRC:.ts=.js) $(NEST_SRC:.ts=.js.map) $(NEST_SRC:.ts=.d.ts)
UI_SRC_OUT := $(UI_TS_SRC:.ts=.js) $(UI_TS_SRC:.ts=.js.map) $(UI_TSX_SRC:.tsx=.js) $(UI_TSX_SRC:.tsx=.js.map)
## Replace src path with out path
NEST_OUT := $(subst $(NEST_SRC_DIR), $(NEST_OUT_DIR), $(NEST_SRC_OUT)) $(NEST_OUT_DIR)/tsconfig.build.tsbuildinfo
UI_OUT := $(subst $(UI_SRC_DIR), $(UI_OUT_DIR), $(UI_SRC_OUT))
## Use the build id as the only mapped result of a NextJS build
UI_NEXT_OUT := $(UI_NEXT_OUT_DIR)/BUILD_ID

.PHONY: all clean nest ui

all: nest ui

nest: $(NEST_OUT)

ui: $(UI_NEXT_OUT)

$(NEST_OUT): node_modules $(NEST_SRC)
	@# Remove files from `NEST_OUT` that don't correspond to source files
	@rm -rf $(filter-out $(NEST_OUT), $(wildcard $(NEST_OUT_DIR)/*.* $(NEST_OUT_DIR)/*/*.*))
	yarn workspace @mines/nest build

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
		$(NEST_OUT_DIR) \
		$(UI_NEXT_OUT_DIR)

print-%:
	@echo '$*=$($*)'
