// Handle game rules button (outside DOMContentLoaded since script is at end of body)
const gameRulesDiv = document.getElementById('game-rules-ui');
const gameUiDiv = document.getElementById('game-ui');
const gameRulesBtn = document.getElementById('start_game_btn');

function hideRulesShowGame()
{
    gameRulesDiv.style.display = 'none';
    gameUiDiv.style.display = 'block';
}
