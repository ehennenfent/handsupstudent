
var url = new URL(window.location.href);
var score = parseInt(url.searchParams.get("score"));
if (isNaN(score)){
  score = Math.floor((Math.random() * 10) - 3);
}

let normal = [0.5, 1, 5, 33, 50, 67, 95, 98, 99.5, 99.9];
let index = Math.max(0, Math.min(9, score + 3 ));
let class_size = 400;
let odds_percent = parseFloat(((100 - normal[index]) * (100 / class_size)).toFixed(3));

numerical_score = document.getElementById('numerical_score');
percentile_large = document.getElementById('percentile_large');
percentile_small = document.getElementById('percentile_small');
call_odds = document.getElementById('call_odds');
call_odds_percent = document.getElementById('call_odds_percent');

numerical_score.textContent = score;
percentile_large.textContent = normal[index];
percentile_small.textContent = normal[index];
call_odds.textContent = parseFloat((100 / odds_percent).toFixed(3));
call_odds_percent.textContent = odds_percent;
