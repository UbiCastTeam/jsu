build_docker_img:
	docker build --tag jsu-docker-image .

install:
	npm install

lint:
ifndef IN_DOCKER
	docker run --rm -v ${CURDIR}:/apps jsu-docker-image make lint
else
	$(MAKE) install
	npm run lint
endif

build:
ifndef IN_DOCKER
	docker run --rm -v ${CURDIR}:/apps jsu-docker-image make build
else
	$(MAKE) install
	npm run build
endif

test:
ifndef IN_DOCKER
	docker run --rm --privileged -v ${CURDIR}:/apps jsu-docker-image make test
else
	$(MAKE) install
	npm test
endif

stop:
	docker container stop jsu

run:
	docker run -dit --rm --name jsu -p 8083:80 -v ${PWD}:/usr/local/apache2/htdocs/ httpd:2.4
