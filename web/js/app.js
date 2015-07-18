(function() {
	var app = angular.module('dreambook', ['ngAnimate']);

	app.controller('DreamController', ['$scope', function($scope) {
		$scope.step = 0;
		$scope.photo = "";

		$scope.dreamPhoto = "";
		$scope.dreamComplete = false;
		dreamPhotoID = "";
		dreamStep = 1;
		lastDreamStep = -1;
		maxDreamStep = 3;
		timer = -1;

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

						document.getElementById('cover').style.backgroundImage = 
							'url(' + $scope.cover + ')';

						document.getElementById('profile').style.backgroundImage =
							'url(' + $scope.profile + ')';
					}
				});
			});

			$scope.$apply(function() {
				$scope.step = 2;
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

		$scope.dream = function(style) {
			$scope.step = 4;

			var client = new HttpClient();
			var uri = "https://45.55.164.254/dream?url=" + encodeURIComponent($scope.photo) + "&template=1";
			console.log("Querying " + uri + "...");

			client.get(uri, function(response) {
				console.log("ID RESPONSE: " + response);
				dreamPhotoID = response;

				refreshImage();
				timer = setInterval(function() {
					refreshImage();
				}, 2000);
			}, function(response) {});	
			
		}

		$scope.back = function(style) {
			$scope.step = 2;
		}

		// Continually refresh image and progress through phases
		var refreshImage = function() {
			var uri = "https://deepdreambook.s3.amazonaws.com/" + dreamPhotoID + dreamStep + ".jpg";
			var client = new HttpClient();

			client.get(uri, function(response) {
				console.log("GOT IMAGE UPDATE: " + uri);
				$scope.dreamPhoto = uri;
				dreamStep++;
				if (dreamStep > maxDreamStep) {
					$scope.$apply(function() {
						$scope.dreamComplete = true;
					});
					clearInterval(timer);
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

	}]);
})();