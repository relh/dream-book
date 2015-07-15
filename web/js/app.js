(function() {
	var app = angular.module('dreambook', ['ngAnimate']);

	app.controller('DreamController', ['$scope', function($scope) {
		$scope.connected = false;
		$scope.photo = "";

		// Initialize FB SDK
		window.fbAsyncInit = function() {
			FB.init({
				appId      : '798590223572873',
				cookie     : true,  // enable cookies to allow the server to access 
				                    // the session
				xfbml      : true,  // parse social plugins on this page
				version    : 'v2.3' // use version 2.3 (2.4 breaks cover photo)
			});

			FB.getLoginStatus(function(response) {
				$scope.$apply(function() {
					$scope.initialized = true;
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
				$scope.cover = response.cover.source;

				document.getElementById('profile').style.backgroundImage =
				'url(' + $scope.profile + ')';
				document.getElementById('cover').style.backgroundImage = 
				'url(' + $scope.cover + ')';
			});

			$scope.$apply(function() {
				$scope.connected = true;
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
			$scope.selected = true;
			$scope.photo = element;
		}

		$scope.dream = function(style) {
			window.location.href = '/dream?image=' + encodeURIComponent($scope.photo) + '&style=' + style;
		}

		$scope.back = function(style) {
			$scope.selected = false;
		}

	}]);
})();