(function() {
	var app = angular.module('dreambook', ['ngAnimate']);

	app.controller('DreamController', ['$scope', function($scope) {
		$scope.step = 0;
		$scope.photo = "";

		$scope.images = [
			"",
			"",
			"",
			"",
			"",
			"",
			"",
			"",
			""
		];

		dreamPhotoIDs = [
			"",
			"",
			"",
			"",
			"",
			"",
			"",
			"",
			""
		];

		dreamSteps = [
			-1,
			-1,
			-1,
			-1,
			-1,
			-1,
			-1,
			-1,
			-1,
			-1
		]

		$scope.progressBar = [
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0
		]

		// 
		templates = [
			{layer: 0, iterations: 30, recursions: 0},
			{layer: 1, iterations: 30, recursions: 0},
			{layer: 2, iterations: 30, recursions: 0},
			{layer: 3, iterations: 30, recursions: 0},
			{layer: 4, iterations: 30, recursions: 0},
			{layer: 5, iterations: 30, recursions: 0},
			{layer: 6, iterations: 30, recursions: 0},
			{layer: 7, iterations: 30, recursions: 0},
		]

		maxDreamStep = 3;

		timers = [
			undefined,
			undefined,
			undefined,
			undefined,
			undefined,
			undefined,
			undefined,
			undefined,
			undefined
		];

		accesstoken = "";

		// Initialize FB SDK
		window.fbAsyncInit = function() {
			FB.init({
				appId      : '798590223572873',
				cookie     : true,  // enable cookies to allow the server to access 
				                    // the session
				xfbml      : true,  // parse social plugins on this page
				version    : 'v2.3' 
			});

			FB.getLoginStatus(function(response) {
				$scope.$apply(function() {
					$scope.step = 1;
				});
				statusChangeCallback(response);
			});
		};

		// Load the SDK asynchronously
		(function(d, s, id) {
			var js, fjs = d.getElementsByTagName(s)[0];
			if (d.getElementById(id)) return;
			js = d.createElement(s); js.id = id;
			js.src = "//connect.facebook.net/en_US/sdk.js";
			fjs.parentNode.insertBefore(js, fjs);
		}(document, 'script', 'facebook-jssdk'));

		// This is called with the results from from FB.getLoginStatus().
		function statusChangeCallback(response) {
			console.log(response);
			if (response.status === 'connected') {
				// Logged into your app and Facebook.
				onConnected();
			}
		}

		var onConnected = function() {
	       accesstoken =   FB.getAuthResponse()['accessToken'];

			$scope.$apply(function() {
				$scope.step = 2;
			});

			FB.api('/me?fields=name,cover,picture.width(9999)', function(response) {
				$scope.profile = response.picture.data.url;

				// Get cover photo
				FB.api('/' + response.cover.id, function(cover) {
					var bigIdx = -1;
					var big = 0;
					for (var i = 0; i < cover.images.length; i++) {
						if (cover.images[i].width > big) {
							bigIdx = i;
							big = cover.images[i].width;
						}
					}

					if (bigIdx != -1) {
						$scope.cover = cover.images[bigIdx].source;

						$scope.dream(templates[0], 0, $scope.profile);
						$scope.dream(templates[1], 1, $scope.profile);
						$scope.dream(templates[2], 2, $scope.profile);
						$scope.dream(templates[3], 3, $scope.profile);
						$scope.dream(templates[4], 4, $scope.cover);
						$scope.dream(templates[5], 5, $scope.cover);
						$scope.dream(templates[6], 6, $scope.cover);
						$scope.dream(templates[7], 7, $scope.cover);

						$scope.$apply(function() {
							$scope.step = 3;
						});
					}
				});
			});
		}
		
		// This function is called when someone finishes with the Login
		// Button.  See the onlogin handler attached to it in the sample
		// code below.
		$scope.checkLoginState = function() {
			FB.getLoginStatus(function(response) {
				statusChangeCallback(response);
			});
		}

		$scope.selectPhoto = function(element) {
			$scope.step = 3;
			$scope.photo = element;
		}

		$scope.dream = function(template, index, photo) {
			if (dreamSteps[index] != -1) {
				return; // already dreaming this photo
			}

			$scope.images[index] = photo;

			var client = new HttpClient();
			var uri = "http://45.55.164.254/dream?url=" + encodeURIComponent(photo) + "&layer=" + template.layer + "&iterations=" + template.iterations + "&recursions=" + template.recursions;
			console.log("Querying " + uri + "...");

			client.get(uri, function(response) {
				console.log("ID RESPONSE: " + response);
				dreamPhotoIDs[index] = response;
				dreamSteps[index] = 0;

				refreshImage(index, photo == $scope.profile);
				timers[index] = setInterval(function() {
					refreshImage(index, photo == $scope.profile);
				}, 2000);
			}, function(response) {
				
			});
		}

		$scope.back = function(index) {
			$scope.step = 2;
		}

		// Continually refresh image and progress through phases
		var refreshImage = function(index, isProfile) {
			var uri = "http://deepdreambook.s3.amazonaws.com/" + dreamPhotoIDs[index] + dreamSteps[index] + ".jpg";
			var client = new HttpClient();

			client.get(uri, function(response) {
				console.log("GOT IMAGE UPDATE: " + uri);
				$scope.$apply(function() {
					$scope.images[index] = uri;
					$scope.progressBar[index] = (dreamSteps[index] / maxDreamStep) * 100;
				});

				dreamSteps[index]++;
				if (dreamSteps[index] > maxDreamStep) {
					$scope.$apply(function() {
						$scope.dreamComplete = true;

						$scope.progressBar[index] = 100;
						$("#img" + index + " .progressbar").css("background-color", "rgba(70, 70, 150, 0.75)");
						$("#img" + index + " .progressbar").css("border", "2px #fff solid");
						$("#img" + index + " .progressbar").css("cursor", "pointer");
						$("#img" + index + " .caption").css("cursor", "pointer");
						$("#img" + index + " .caption").css("background", "none");
						
						if (isProfile) {
							$("#img" + index + " .caption").html("<a>Set Profile Picture</a>");
							$("#img" + index + " .caption").click(function () {
								$(this).html("Loading...");
								upPhoto($scope.images[index], true);
							});
						}
						else {
							$("#img" + index + " .caption").html("<a>Set Cover Photo</a>");
							$("#img" + index + " .caption").click(function () {
								$(this).html("Loading...");
								upPhoto($scope.images[index], false);
							});
						}
						
					});
					clearInterval(timers[index]);
				}
			}, function(response) {
				// do nothing on error
			});
		}

		var HttpClient = function() {
		    this.get = function(url, success, error) {
		        var httpRequest = new XMLHttpRequest();

		        httpRequest.onreadystatechange = function() { 
		            if (httpRequest.readyState == 4 && httpRequest.status == 200)
		                success(httpRequest.responseText);
		            else
		            	error(httpRequest.status);
		        }

		        httpRequest.open( "GET", url, true );            
		        httpRequest.send( null );
		    }
		}

		var upPhoto = function(photo, isProfile) {
			    FB.login(function(response) {
			       if (response.authResponse) {
			         var access_token =   FB.getAuthResponse()['accessToken'];
			         console.log('Access Token = '+ access_token);
						FB.api('me/photos', 'post', {
				            message: 'Created with http://dreambook.io',
			            	url: photo,
			            	status: 'success',
			            	access_token: accesstoken
			        	}, function (response) {
				            if (!response || response.error) {
				                console.log('Error occured:' + response);
				                console.log(response);
				            } else {
				                console.log('Post ID: ' + response.id);
				                if (isProfile) {
		                			window.location.href = "http://www.facebook.com/photo.php?fbid=" + response.id + "&makeprofile=1";
				                }
				                else {
				                	window.location.href = "http://www.facebook.com/profile.php?preview_cover=" + response.id;
				                }
				            }
				        });
			       } else {
			         console.log('User cancelled login or did not fully authorize.');
			       }
			     }, {scope: 'publish_actions'});
		}

		var getRandom = function (set) {
			var rand = Math.random();
			var total = 1;
			console.log(rand);
			for (var i = 0; i < set.length; i++) {
				total -= set[i].chance;
				if (rand > total) {
					return set[i];
				}
			}
		}

		// from https://css-tricks.com/snippets/javascript/shuffle-array/ due to laziness
		function Shuffle(o) {
			for(var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
			return o;
		};


		Shuffle(templates);
	}]);

	app.filter('slice', function() {
	  	return function(arr, start, end) {
	    return arr.slice(start, end);
	  };
	});
})();