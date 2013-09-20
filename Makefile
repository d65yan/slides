all:
	./run.sh

upgrade update:
	npm upgrade

config:
	heroku config:push --app aboutplace

install:
	git push heroku master
