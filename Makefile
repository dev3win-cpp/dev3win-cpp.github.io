build:
	flutter clean  && \
	flutter build web --base-href /test2/ && \
	rm -r /Users/tadeusz/Dev/projects/www/dev3win-cpp.github.io/test2 && \
	mkdir -p /Users/tadeusz/Dev/projects/www/dev3win-cpp.github.io/test2 && \
	cp -R build/web/* /Users/tadeusz/Dev/projects/www/dev3win-cpp.github.io/test2 && \
	cd /Users/tadeusz/Dev/projects/www/dev3win-cpp.github.io/test2 && \
	git add -A && \
	git commit -m 'test2' && \
	git push origin main && \
	cd /Users/tadeusz/Dev/projects/flutter/cool_names