
install:
	npm install

lint: install
	npm run lint

build: install
	npm run build

test: install
	npm test

stop:
	docker container stop jsu

run:
	docker run -dit --rm --name jsu -p 8083:80 -v ${PWD}:/usr/local/apache2/htdocs/ httpd:2.4