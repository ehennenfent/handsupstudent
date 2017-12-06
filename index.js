var config = {
    databaseURL: "https://hands-up-f011c.firebaseio.com/",
  };

firebase.initializeApp(config);

var randomKey = function (obj) {
    var keys = Object.keys(obj)
    return keys[ keys.length * Math.random() << 0];
};

   // Get a reference to the database service
var database = firebase.database();
database.ref('/users').once('value').then(function (snapshot){
  let userdata = snapshot.val();

  var url = new URL(window.location.href);
  var username = url.hash.substr(1);
  let random_user_name = randomKey(userdata);
  if (username != null){
    random_user_name = username;
  }
  if (userdata[random_user_name] == null){
    random_user_name = randomKey(userdata);
  }

  var score = userdata[random_user_name]['score'];

  user_name = document.getElementById('user_name');
  user_email = document.getElementById('user_email');
  numerical_score = document.getElementById('numerical_score');

  user_name.textContent = userdata[random_user_name]['name'];
  user_email.textContent = userdata[random_user_name]['email'];
  numerical_score.textContent = score;

  let normal = [0.5, 1, 5, 33, 50, 67, 95, 98, 99.5, 99.9];
  let index = Math.max(0, Math.min(9, score + 3 ));
  let class_size = 400;
  let odds_percent = parseFloat(((100 - normal[index]) * (100 / class_size)).toFixed(3));

  numerical_score = document.getElementById('numerical_score');
  percentile_large = document.getElementById('percentile_large');
  percentile_small = document.getElementById('percentile_small');
  call_odds = document.getElementById('call_odds');
  call_odds_percent = document.getElementById('call_odds_percent');

  volunteer = document.getElementById('volunteer');
  first_group = document.getElementById('first_group');

  if (userdata[random_user_name]['did_volunteer'] || (userdata[random_user_name]['group'] == 0)){
    first_group.style.display = "block";
    if (userdata[random_user_name]['did_volunteer']){
      backout = document.getElementById('backout');
      backout.style.display = "block";
      backout.onclick = function(){do_backout(random_user_name)};
    }
  }
  else{
    volunteer.style.display = "block";
    volunteer.onclick = function(){do_volunteer(random_user_name)};
  }

  numerical_score.textContent = score;
  percentile_large.textContent = normal[index];
  percentile_small.textContent = normal[index];

});

var do_volunteer = function (user_to_volunteer){
  var updates = {};
  updates ['/users/' + user_to_volunteer + '/did_volunteer'] = true;
  database.ref().update(updates).then(function (){
    var url = new URL(window.location.href);
    url.hash = user_to_volunteer;
    location.href = url.href;
    location.reload();
  }).catch(function (){
    console.log("Something went wrong");
  });
}

var do_backout = function (user_to_volunteer){
  var updates = {};
  updates ['/users/' + user_to_volunteer + '/did_volunteer'] = false;
  database.ref().update(updates).then(function (){
    var url = new URL(window.location.href);
    url.hash = user_to_volunteer;
    location.href = url.href;
    location.reload();
  }).catch(function (){
    console.log("Something went wrong");
  });
}
