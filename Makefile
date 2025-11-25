DOCKER_IMAGE ?= jsu-image
DOCKER_RUN ?= docker run \
	--name jsu-container \
	--workdir /apps \
	--mount type=bind,src=${PWD},dst=/apps \
	--user "$(shell id -u):$(shell id -g)" \
	--rm -it

docker_build:
	docker build --tag ${DOCKER_IMAGE} .

docker_rebuild:
	docker build --no-cache -t ${DOCKER_IMAGE} .

lint:
	${DOCKER_RUN} ${DOCKER_IMAGE} make lint_local

lint_local:
	npm run lint

build:
	${DOCKER_RUN} ${DOCKER_IMAGE} make build_local

build_local:
	npm run build

test:
	${DOCKER_RUN} --privileged ${DOCKER_IMAGE} make test_local

test_local:
	npm test

run:
	docker run -it --rm --name jsu-httpd -p 8083:80 -v ${PWD}:/usr/local/apache2/htdocs/ httpd:2.4
