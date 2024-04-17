BIN_PATH = "./bin/index.js"
DEV_PATH = "./src/index.ts"
NODE_DEV = NODE_ENV=dev
NODE_PROD = NODE_ENV=prod
TS_NODE = "./node_modules/.bin/ts-node"

# Commands
GDR = "gitlab-daily-recap"

build:
	npm run build

watch:
	npm run watch

jest:
	npm run jest

eslint:
	npx eslint -c eslint-config.json src

prettier:
	npm run prettier

lint:
	make prettier
	make eslint

install:
	npm install
	make build

global_install:
	# install globally
	# with that you can use tli from anywhere
	make install
	npm install -g .
	chmod +x BIN_PATH # make it executable
	tli -h

uninstall:
	npm uninstall -g tli

dev:
	$(NODE_DEV) $(TS_NODE) $(DEV_PATH) $(cmd)

prod:
	$(NODE_PROD) $(BIN_PATH) $(cmd) $(cmd)