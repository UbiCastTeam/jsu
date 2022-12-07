DOCKER_IMAGE_NAME ?= jsu-docker-image

build_docker_img:
	docker build --tag ${DOCKER_IMAGE_NAME} .

install:
	npm install

lint:
ifndef IN_DOCKER
	docker run -it --rm -v ${CURDIR}:/apps ${DOCKER_IMAGE_NAME} make lint
else
	$(MAKE) install
	npm run lint
endif

build:
ifndef IN_DOCKER
	docker run -it --rm -v ${CURDIR}:/apps ${DOCKER_IMAGE_NAME} make build
else
	$(MAKE) install
	npm run build
endif

test:
ifndef IN_DOCKER
	docker run -it --rm --privileged -v ${CURDIR}:/apps ${DOCKER_IMAGE_NAME} make test
else
	$(MAKE) install
	npm test
endif

run:
	docker run -it --rm --name jsu-httpd -p 8083:80 -v ${PWD}:/usr/local/apache2/htdocs/ httpd:2.4
