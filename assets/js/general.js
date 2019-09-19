(function() {
	var dbm = {
		addEvent: function(el, type, handler) {
			if(el.attachEvent) {
				el.attachEvent('on' + type, handler);
			} else {
				el.addEventListener(type, handler);
			}
		},
		onReady: function(ready) {
			if(document.readyState !== "loading") {
				// Document is already loaded
				ready();
			} else if(document.addEventListener) {
				// Modern browsers
				document.addEventListener('DOMContentLoaded', ready);
			} else {
				// IE <= 8
				document.attachEvent('onreadystatechange', function() {
					if(document.readyState === "complete") {
						ready();
					}
				});
			}
		}
	}

	function initNav() {
		var mainNav = document.querySelector('.js-main-nav'),
			pageHeader = document.querySelector('.js-page-header'),
			navTrigger = document.querySelector('.js-main-nav-trigger');
		dbm.addEvent(navTrigger, 'click', function(e) {
			e.preventDefault();
			var text = navTrigger.innerText,
				textToggle = navTrigger.getAttribute('data-text-toggle');
			mainNav.classList.toggle('nav-open');
			pageHeader.classList.toggle('nav-open');
			navTrigger.classList.toggle('nav-open');
			navTrigger.innerText = textToggle;
			navTrigger.setAttribute('data-text-toggle', text);
			textToggle = text;
		});
	}

	function initSearch() {
		var request = new XMLHttpRequest();
		request.open('GET', '/assets/js/index.json', true);
		request.onload = function(){
			if(request.status >= 200 && request.status < 400) {
				var data = JSON.parse(request.responseText);
				lunr.tokenizer.separator = /[\s/]+/
				var index = lunr(function() {
					this.ref('id');
					this.field('title', { boost: 200 });
					this.field('content', { boost: 2 });
					this.field('url');
					this.metadataWhitelist = ['position']
					for(var i in data) {
						this.add({
							id: i,
							title: data[i].title,
							content: data[i].content,
							url: data[i].url
						});
					}
				});
				var index = index,
					docs = data,
					searchInput = document.querySelector('.js-search-input'),
					searchResults = document.querySelector('.js-search-results');
				dbm.addEvent(searchInput, 'keydown', function(e) {
					switch(e.keyCode) {
						case 38: // arrow up
							e.preventDefault();
							var active = document.querySelector('.search-result.active');
							if(active) {
								active.classList.remove('active');
								if(active.parentElement.previousSibling) {
									active.parentElement.previousSibling.querySelector('.search-result').classList.add('active');
								}
							}
							return;
						case 40: // arrow down
							e.preventDefault();
							var active = document.querySelector('.search-result.active');
							if(active) {
								if(active.parentElement.nextSibling) {
									var next = active.parentElement.nextSibling.querySelector('.search-result');
									active.classList.remove('active');
									next.classList.add('active');
								}
							} else {
								var next = document.querySelector('.search-result');
								if(next) {
									next.classList.add('active');
								}
							}
							return;
						case 13: // enter
							e.preventDefault();
							var active = document.querySelector('.search-result.active');
							if(active) {
								active.click();
							} else {
								var first = document.querySelector('.search-result');
								if(first) {
									first.click();
								}
							}
							return;
					}
				});
				dbm.addEvent(searchInput, 'keyup', function(e) {
					switch(e.keyCode) {
						case 27: // esc
							searchResults.innerHTML = '';
							searchResults.classList.remove('active');
							searchInput.value = '';
							return;
						case 38: // arrow up
						case 40: // arrow down
						case 13: // enter
							e.preventDefault();
							return;
					}
					searchResults.innerHTML = '';
					searchResults.classList.remove('active');
					var input = this.value;
					if(input === '') {
						return;
					}
					var results = index.query(function(query) {
						var tokens = lunr.tokenizer(input);
						query.term(tokens, {
							boost: 10
						});
						query.term(tokens, {
							wildcard: lunr.Query.wildcard.TRAILING
						});
					});
					if(results.length > 0) {
						searchResults.classList.add('active');
						var resultsList = document.createElement('ul');
						resultsList.classList.add('search-results-list');
						searchResults.appendChild(resultsList);
						for(var i in results) {
							var result = results[i],
								doc = docs[result.ref];
							// Results list item
							var resultsListItem = document.createElement('li');
							resultsListItem.classList.add('search-results-list-item');
							resultsList.appendChild(resultsListItem);
							// Results link
							var resultLink = document.createElement('a');
							resultLink.classList.add('search-result');
							resultLink.setAttribute('href', doc.url);
							resultsListItem.appendChild(resultLink);
							// Results title
							var resultTitle = document.createElement('div');
							resultTitle.classList.add('search-result-title');
							resultTitle.innerText = doc.title;
							resultLink.appendChild(resultTitle);
							// Results url
							var resultRelUrl = document.createElement('span');
							resultRelUrl.classList.add('search-result-rel-url');
							resultRelUrl.innerText = doc.relUrl;
							resultTitle.appendChild(resultRelUrl);
							//
							var metadata = result.matchData.metadata,
								contentFound = false;
							for(var j in metadata) {
								if(metadata[j].title) {
									var position = metadata[j].title.position[0];
									var start = position[0];
									var end = position[0] + position[1];
									resultTitle.innerHTML = doc.title.substring(0, start) + '<span class="search-result-highlight">' + doc.title.substring(start, end) + '</span>' + doc.title.substring(end, doc.title.length) + '<span class="search-result-rel-url">' + doc.relUrl + '</span>';
								} else if(metadata[j].content && !contentFound) {
									contentFound = true;
									var position = metadata[j].content.position[0],
										start = position[0],
										end = position[0] + position[1],
										previewStart = start,
										previewEnd = end,
										ellipsesBefore = true,
										ellipsesAfter = true;
									for(var k = 0; k < 3; k++) {
										var nextSpace = doc.content.lastIndexOf(' ', previewStart - 2),
											nextDot = doc.content.lastIndexOf('.', previewStart - 2);
										if(nextDot > 0 && nextDot > nextSpace) {
											previewStart = nextDot + 1;
											ellipsesBefore = false;
											break;
										}
										if(nextSpace < 0) {
											previewStart = 0;
											ellipsesBefore = false;
											break;
										}
										previewStart = nextSpace + 1;
									}
									for(var k = 0; k < 10; k++) {
										var nextSpace = doc.content.indexOf(' ', previewEnd + 1),
											nextDot = doc.content.indexOf('.', previewEnd + 1);
										if(nextDot > 0 && nextDot < nextSpace) {
											previewEnd = nextDot;
											ellipsesAfter = false;
											break;
										}
										if(nextSpace < 0) {
											previewEnd = doc.content.length;
											ellipsesAfter = false;
											break;
										}
										previewEnd = nextSpace;
									}
									var preview = doc.content.substring(previewStart, start);
									if(ellipsesBefore) {
										preview = '... ' + preview;
									}
									preview += '<span class="search-result-highlight">' + doc.content.substring(start, end) + '</span>' + doc.content.substring(end, previewEnd);
									if(ellipsesAfter) {
										preview += ' ...';
									}
									var resultPreview = document.createElement('div');
									resultPreview.classList.add('search-result-preview');
									resultPreview.innerHTML = preview;
									resultLink.appendChild(resultPreview);
								}
							}
						}
					}
				});
				dbm.addEvent(searchInput, 'blur', function() {
					setTimeout(function(){
						searchResults.innerHTML = '';
						searchResults.classList.remove('active');
					}, 300);
				});
			} else {
				console.log('Error loading ajax request. Request status:' + request.status);
			}
		};
		request.onerror = function(){
			console.log('There was a connection error');
		};
		request.send();
	}

	function initThemeToggle() {
		var toggleDarkMode = document.querySelector('.js-toggle-dark-mode'),
			cssFile = document.querySelector('[rel="stylesheet"]'),
			originalCssRef = cssFile.getAttribute('href'),
			darkModeCssRef = originalCssRef.replace('general.css', 'general-dark.css'),
			buttonCopy = ['Light mode', 'Dark mode'],
			updateButtonText = function() {
				toggleDarkMode.textContent === buttonCopy[0] ? toggleDarkMode.textContent = buttonCopy[1] : toggleDarkMode.textContent = buttonCopy[0];
			};
		dbm.addEvent(toggleDarkMode, 'click', function() {
			cssFile.setAttribute('href', cssFile.getAttribute('href') === originalCssRef ? darkModeCssRef : originalCssRef);
			updateButtonText();
		});
	}

	dbm.onReady(function() {
		initNav();
		initSearch();
		initThemeToggle();
	});
})();