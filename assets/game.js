/*
 * Copyright (c) Valentin Galea
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
*/

// version 2.1

//
// the dot table matrix
//
	var w8 = 10;
	var h8 = 10;
	var padd = 2;
	var numX = 11;
	var numY = 20;
	
	var colorDraw = "#000000";
	var colorErase = "#C0C0C0";

	function scale(val)
	{
	//	var scale = window.devicePixelRatio;
	//	if( scale == undefined )
	//		scale = 1;
			
		return (1 * val);
	}
	
	function drawHTML()
	{
		document.writeln('<table id="canvas" border="0" cellspacing="' + scale(padd) + '" cellpadding="0">');
		
		for ( y = 0; y < numY; y++ )
		{
			document.writeln('<tr style="height:' + scale(h8) + 'px;">');
			for ( x = 0; x < numX; x++ )
				document.write('<td id="t' + (y) + '_' + (x) + '" style="background-color:' + colorErase + '; width:' + scale(w8) + 'px;"></td>');
			document.writeln('</tr>');
		}
		
		document.writeln('</table>');
	}
	
//
// game vars
//
	var MAXITEMS = 2;
	var MAXFPS = 50.0;
	var STARTFPS = 1.0;
	var fps = STARTFPS;
	
	var level = 0;
	var score = 0, maxScore = 0;
	var kmh = 0;

	var timeToReachMaxFps = 150 * 1000;
	var fpsIncr = 1000/timeToReachMaxFps * MAXFPS;
	var maxLevelsToReach = 10;
	var levelSwitchTable = new 			Array(  350,  700, 1000, 1500, 2000, 2750, 3500, 4000, 4500, 5000 );
	var spawnMinIntervalPerLevel = new  Array( 4000, 3000, 2500, 2000, 2000, 2000, 1500, 1000,  750,  500 );
	var spanwBiasPerLevel = new 		Array( 1500, 1250, 1000, 1000,  750,  700,  500,  500,  500,  500 );
		
//
// the 'road'
//
	function drawRoad()
	{
		var modulus = 3 + Math.round(Math.random() * 5);
		for ( y = 0; y < numY; y++ )
			if ( (y % modulus != 0) )
			{
				document.getElementById( 't'+(y)+'_0' ).style.backgroundColor = colorDraw;
				document.getElementById( 't'+(y)+'_'+(numX-1) ).style.backgroundColor = colorDraw;
			}	
	}
	
	function scrollRoad()
	{
		for ( y = numY-1; y >= 0; y-- )
		{
			var srcX, srcY;
			srcX = 0;
			srcY = y - 1;
			if ( srcY < 0 )
				srcY = numY-1;
			src = document.getElementById( 't'+(srcY)+'_'+(srcX) ).style.backgroundColor;
			document.getElementById( 't'+(y)+'_'+(srcX) ).style.backgroundColor = src;

			srcX = numX-1;
			srcY = y - 1;
			if ( srcY < 0 )
				srcY = numY-1;
			src = document.getElementById( 't'+(srcY)+'_'+(srcX) ).style.backgroundColor;
			document.getElementById( 't'+(y)+'_'+(srcX) ).style.backgroundColor = src;
		}			
	}
	
//
// player car
// 
	var playCarX;
	var playCarY;
	//   8
	//  567 
	//   1<---- (playCarX, playCarY)
	//  234
		
	function drawPlayerCar(col)
	{
		document.getElementById( 't'+(playCarY  )+'_'+(playCarX  ) ).style.backgroundColor = col;
		document.getElementById( 't'+(playCarY+1)+'_'+(playCarX-1) ).style.backgroundColor = col;
		document.getElementById( 't'+(playCarY+1)+'_'+(playCarX  ) ).style.backgroundColor = col;
		document.getElementById( 't'+(playCarY+1)+'_'+(playCarX+1) ).style.backgroundColor = col;		
		document.getElementById( 't'+(playCarY-1)+'_'+(playCarX-1) ).style.backgroundColor = col;
		document.getElementById( 't'+(playCarY-1)+'_'+(playCarX  ) ).style.backgroundColor = col;
		document.getElementById( 't'+(playCarY-1)+'_'+(playCarX+1) ).style.backgroundColor = col;
		document.getElementById( 't'+(playCarY-2)+'_'+(playCarX  ) ).style.backgroundColor = col;
	}
	
	function scrollPlayerCarToLeft(amount)
	{
		if ( state != STATE_GAME )
			return;
	
		if ( playCarX-1-amount <= 0 )
			amount = 1;
			
		if ( playCarX-1-amount == 0 )
		{
			if ( fps > fpsIncr && fps > STARTFPS )
				fps -= fpsIncr/2;
			if ( score > 5 )
				score -= 5;
			return;
		}
		
		drawPlayerCar(colorErase);		
		playCarX -= amount;
		drawPlayerCar(colorDraw);
		
		for ( i = 0; i < MAXITEMS; i++ )
		{
			if ( cubes[i].visible && (cubes[i].X == playCarX-1) && (cubes[i].Y > numY-6) && (cubes[i].Y < numY-1) ) {
				enterState(STATE_WIPE_ANIM);
				return;
			}	
			if ( enemyCars[i].visible && (playCarX-enemyCars[i].X == 2) && (enemyCars[i].Y > numY-9) && (enemyCars[i].Y < numY-2) ) {
				enterState(STATE_WIPE_ANIM);
				return;
			}
		}	
	}

	function scrollPlayerCarToRight(amount)
	{
		if ( state != STATE_GAME )
			return;
	
		if ( playCarX+1+amount >= (numX-1) )
			amount = 1;
		
		if ( playCarX+1+amount == (numX-1) )
		{
			if ( fps > fpsIncr && fps > STARTFPS )
				fps -= fpsIncr/2;
			if ( score > 5 )
				score -= 5;		
			return;
		}

		drawPlayerCar(colorErase);		
		playCarX += amount;
		drawPlayerCar(colorDraw);
		
		for ( i = 0; i < MAXITEMS; i++ )
		{
			if ( cubes[i].visible && (cubes[i].X == playCarX+1) && (cubes[i].Y > numY-6) && (cubes[i].Y < numY-1) ) {
				enterState(STATE_WIPE_ANIM);
				return;
			}	
			if ( enemyCars[i].visible && (enemyCars[i].X-playCarX == 2) && (enemyCars[i].Y > numY-9) && (enemyCars[i].Y < numY-2) ) {
				enterState(STATE_WIPE_ANIM);
				return;
			}
		}
	}

//
// cube obstacle
//
	function cube()
	{
		this.visible = false;
		this.X = 0;
		this.Y = 0;
	}
	var cubes = new Array();
	cubes[0] = new cube();
	cubes[1] = new cube();
	cubes[2] = new cube();
	
	function spawnCube(cube)
	{
		cube.visible = true;
		
		cube.X = Math.round(Math.random()*(numX));
		if ( cube.X == 0 )
			cube.X = 1;
		if ( cube.X > (numX-3) )
			cube.X = numX-3;
			
		cube.Y = -2;
	}
	
	function drawCube(cube, color)
	{
		if ( cube.Y >= 0 )
		{
			document.getElementById( 't'+(cube.Y)+'_'+(cube.X  ) ).style.backgroundColor = color;
			document.getElementById( 't'+(cube.Y)+'_'+(cube.X+1) ).style.backgroundColor = color;
		}

		if ( (cube.Y < numY-1) && ((cube.Y) >= -1) )
		{
			document.getElementById( 't'+(cube.Y+1)+'_'+(cube.X  ) ).style.backgroundColor = color;
			document.getElementById( 't'+(cube.Y+1)+'_'+(cube.X+1) ).style.backgroundColor = color;
		}	
	}
	
	function scrollCube(cube)
	{
		drawCube(cube, colorErase);
		cube.Y++;
		if ( cube.Y < numY )
			drawCube(cube, colorDraw);
		else {
			cube.visible = false;
			score += 50;
		}
	}
	
//
// Enemy Car
//
	//   1
	//  234 
	//   5
	//  678
	function enemyCar()
	{
		this.visible = false;
		this.X = 0;
		this.Y = 0;
		//this.targetX = 0;
		//this.timer = 0;
	}
	var enemyCars = new Array();
	enemyCars[0] = new enemyCar();
	enemyCars[1] = new enemyCar();
	enemyCars[2] = new enemyCar();

  	function drawEnemyCar(enemyCar, col)
	{
		if ( enemyCar.Y >= 0 )
			document.getElementById( 't'+(enemyCar.Y  )+'_'+(enemyCar.X  ) ).style.backgroundColor = col;
		
		if ( (enemyCar.Y >= -1) && (enemyCar.Y < numY-1) )
		{
			document.getElementById( 't'+(enemyCar.Y+1)+'_'+(enemyCar.X-1) ).style.backgroundColor = col;
			document.getElementById( 't'+(enemyCar.Y+1)+'_'+(enemyCar.X  ) ).style.backgroundColor = col;
			document.getElementById( 't'+(enemyCar.Y+1)+'_'+(enemyCar.X+1) ).style.backgroundColor = col;
		}
		
		if ( (enemyCar.Y >= -2) && (enemyCar.Y < numY-2) )
			document.getElementById( 't'+(enemyCar.Y+2)+'_'+(enemyCar.X  ) ).style.backgroundColor = col;
		
		if ( (enemyCar.Y >= -3) && (enemyCar.Y < numY-3) )
		{
			document.getElementById( 't'+(enemyCar.Y+3)+'_'+(enemyCar.X-1) ).style.backgroundColor = col;
			document.getElementById( 't'+(enemyCar.Y+3)+'_'+(enemyCar.X  ) ).style.backgroundColor = col;
			document.getElementById( 't'+(enemyCar.Y+3)+'_'+(enemyCar.X+1) ).style.backgroundColor = col;
		}

	}
	
	function spawnCar(enemyCar)
	{
		enemyCar.visible = true;
		
		enemyCar.X = Math.round(Math.random()*(numX));
		
		if ( enemyCar.X <= 1 )
			enemyCar.X = 2;
		if ( enemyCar.X > (numX-4) )
			enemyCar.X = numX-4;
			
		enemyCar.Y = -4;
		
		//enemyCar.targetX = playCarX;
		//enemyCar.timer = 0;
	}
	
	function scrollCar(car)
	{
		drawEnemyCar(car, colorErase);
		
		car.Y ++;
		/*if ( car.X != car.targetX ) {
			if ( car.timer && car.timer % 3 == 0)
				if ( car.X < car.targetX ) {
					car.X++;
				} else {
					car.X--;
				}
			car.timer++;
		}*/
				
		if ( car.Y < numY )
			drawEnemyCar(car, colorDraw);
		else {
			car.visible = false;
			score += 100;
		}
	}
		
//	
// Main
//	
	var STATE_GAME = 1;
	var STATE_WIPE_ANIM = 2;
	var STATE_RESTART = 3;
	var STATE_PAUSED = 4;
	
	var state = STATE_RESTART;

	var wipeThread, scrollerThread, spawnerThread, fpsIncrThread;	
	
	var currWipeLine = 0;
	function doWipe()
	{
		if ( state != STATE_WIPE_ANIM )
			return;

		if ( currWipeLine == numY )
		{
			enterState(STATE_RESTART);
			return;
		}
		
		for ( x = 0; x < numX; x++ )
			document.getElementById( 't'+currWipeLine+'_'+x ).style.backgroundColor = colorDraw;
			
		currWipeLine++;	
		wipeThread = setTimeout("doWipe()", (1000/12));
	}

	var nextSpawnChance;
	function spawnStuff( justCalcChance )
	{			
		var dice = Math.round(Math.random() * 100.0) % 2;
		
		if ( !justCalcChance )
			if ( state == STATE_GAME )
				if ( dice == 0 ) // cube
				{
					for ( i = 0; i < MAXITEMS; i++ )
						if ( !cubes[i].visible )
							break;
					if ( i < MAXITEMS )
						spawnCube( cubes[i] );
				}
				else // car
				{
					for ( i = 0; i < MAXITEMS; i++ )
						if ( !enemyCars[i].visible )
							break;
					if ( i < MAXITEMS )
						spawnCar( enemyCars[i] );		
				}

		nextSpawnChance = spawnMinIntervalPerLevel[level] + Math.round(Math.random() * spanwBiasPerLevel[level]);
		spawnerThread = setTimeout("spawnStuff()", nextSpawnChance);
	}
		
	function runGame()
	{
		if ( state != STATE_GAME )
			return;
			
		scrollRoad();
		
		for ( i = 0; i < MAXITEMS; i++ )
		{
			if ( cubes[i].visible )
				scrollCube( cubes[i] );
			if ( enemyCars[i].visible )
				scrollCar( enemyCars[i] );
		}
				
		// colision check
		if (   document.getElementById( 't'+(playCarY-3)+'_'+(playCarX  ) ).style.backgroundColor == colorTestHack
			|| document.getElementById( 't'+(playCarY-2)+'_'+(playCarX-1) ).style.backgroundColor == colorTestHack 
			|| document.getElementById( 't'+(playCarY-2)+'_'+(playCarX+1) ).style.backgroundColor == colorTestHack )
		{
			enterState(STATE_WIPE_ANIM);
			return;
		}
		
		document.getElementById("ui_level").innerHTML = level+1;
		document.getElementById("ui_score").innerHTML = score;
		kmh = Math.round(fps * 6);
		document.getElementById(  "ui_kmh").innerHTML = kmh;
		
		if ( score >= levelSwitchTable[level] && level < maxLevelsToReach ) {
			level++;
		}
		
		if ( fps > MAXFPS ) {
			fps = MAXFPS;
			clearInterval(fpsIncrThread);
		}
		
		scrollerThread = setTimeout("runGame()", (1000/fps));
	}

	function keyAction(ev)
	{
		if ( state != STATE_GAME )
			return;
	
		switch ( ev.keyCode )
		{
		case 37: //arrow left
			scrollPlayerCarToLeft();
			break;
		case 39: //arrow right
			scrollPlayerCarToRight();
			break;
		}
	}

	var colorTestHack;
	function doRestart( firstTimeOnly )
	{
		currWipeLine = 0;
		for ( y = 0; y < numY; y++ )
			for ( x = 0; x < numX; x++ )
				document.getElementById( 't'+y+'_'+x ).style.backgroundColor = colorErase;

		for ( i = 0; i < MAXITEMS; i++ )
		{
			cubes[i].visible = false;
			enemyCars[i].visible = false;
		}

		drawRoad();
		
		playCarX = Math.round(numX/2)-1;
		playCarY = numY-3;		
		drawPlayerCar(colorDraw);
		colorTestHack = document.getElementById( 't'+(playCarY)+'_'+(playCarX) ).style.backgroundColor;
		
		fps = STARTFPS;
		level = 0;
		score = 0;
		kmh = 0;
			
		if( firstTimeOnly )
			enterState(STATE_PAUSED);
		else
			enterState(STATE_GAME);
	}

	function submitScore()
	{
		if ( maxScore < score )
			maxScore = score;
		else
			return false;
			
		if ( maxScore > 0 )
			window.AndroidInterface.submitScore( maxScore );
		
		return true;
	}


	function enterState(newState)
	{
		switch ( state ) // old
		{
		case STATE_GAME:
			clearInterval(fpsIncrThread);
			clearTimeout(scrollerThread);
			clearTimeout(spawnerThread);
			break;	
		case STATE_WIPE_ANIM:
			clearTimeout(wipeThread);
			break;
		case STATE_RESTART:				
			break;
		case STATE_PAUSED:
			break;
		}

		state = newState;
		
		switch ( state )
		{
		case STATE_GAME:
			fpsIncrThread = setInterval("eval(fps += fpsIncr);", 1000);
			runGame();
			spawnStuff( true );
			break;
		case STATE_WIPE_ANIM:
			doWipe();
			break;
		case STATE_RESTART:
			if( submitScore() )
				enterState( STATE_PAUSED );
			else
				doRestart();
			break;
		case STATE_PAUSED:
			clearTimeout(wipeThread);
			clearTimeout(scrollerThread);
			clearTimeout(spawnerThread);
			clearInterval(fpsIncrThread);		
			break;
		}
	}
	
	function togglePause()
	{
		if( state == STATE_WIPE_ANIM )
			return;
			
		if( state != STATE_PAUSED )
			enterState( STATE_PAUSED )
		else
			enterState( STATE_GAME );	
	}
