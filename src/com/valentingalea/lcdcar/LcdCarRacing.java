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

package com.valentingalea.lcdcar;

import java.util.Random;

import android.app.Activity;
import android.app.Dialog;
import android.app.ProgressDialog;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.Bundle;
import android.view.Gravity;
import android.view.KeyEvent;
import android.view.View;
import android.view.View.OnClickListener;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.TextView;
import android.widget.Toast;

import com.scoreloop.client.android.ui.EntryScreenActivity;
import com.scoreloop.client.android.ui.OnScoreSubmitObserver;
import com.scoreloop.client.android.ui.PostScoreOverlayActivity;
import com.scoreloop.client.android.ui.ScoreloopManagerSingleton;
import com.scoreloop.client.android.ui.ShowResultOverlayActivity;

public class LcdCarRacing extends Activity implements OnScoreSubmitObserver
{
	protected static final String INTENT_SUBMIT_SCORE = "com.valentingalea.lcdcar.submit";
	protected static final String STR_START = "START";
	protected static final String STR_PAUSE = "PAUSE";
	protected static final int SHOW_RESULT = 0;
	protected static final int POST_SCORE = 1;
	protected static final int DLG_LOADING = 0xCCC;

	protected WebView mBrowser;
	protected TextView mBtnLabel;
	protected int mSubmitStatus;
	protected boolean mRunning = false;
	protected boolean mSubmit = false;
	protected boolean mDoRestart = false;
	protected Random mRandomizer = new Random();

	@Override
	public void onCreate(Bundle savedInstanceState)
	{
		super.onCreate(savedInstanceState);

		setContentView(R.layout.main);

		mBrowser = (WebView)findViewById(R.id.browser);

		WebSettings webSettings = mBrowser.getSettings();
		webSettings.setJavaScriptEnabled(true);
		webSettings.setSupportZoom(false);
		mBrowser.setVerticalScrollBarEnabled(false);
		mBrowser.setHorizontalScrollBarEnabled(false);
		mBrowser.addJavascriptInterface(new AndroidInterface(getApplicationContext()), "AndroidInterface");
		mBrowser.setWebViewClient(
				new WebViewClient() {
					@Override
					public void onPageFinished(WebView view, String url) {
						int id = mRandomizer.nextInt(3);
						if( id == 2 )
							return;
						int strId = R.string.help_1 + id;								
						Toast msg = Toast.makeText(LcdCarRacing.this, strId, Toast.LENGTH_LONG);
						msg.setGravity(Gravity.TOP|Gravity.CENTER_HORIZONTAL, 0, 0);
						msg.show();					
					}
				}
			);
		
		mBrowser.loadUrl("file:///android_asset/game.html");

		findViewById(R.id.go).setOnClickListener(new OnClickListener() {
			@Override
			public void onClick(View v) {
				mBrowser.loadUrl("javascript:togglePause();");
				mRunning = !mRunning;
				mBtnLabel.setText(mRunning ? STR_PAUSE : STR_START);
			}
		});

		findViewById(R.id.menu).setOnClickListener(new OnClickListener() {
			@Override
			public void onClick(View v) {
				startActivity(new Intent(LcdCarRacing.this, EntryScreenActivity.class));
			}
		});
		
		findViewById(R.id.left).setOnClickListener(new OnClickListener() {
			@Override
			public void onClick(View v) {
				mBrowser.loadUrl("javascript:scrollPlayerCarToLeft(1);");
			}
		});		

		findViewById(R.id.right).setOnClickListener(new OnClickListener() {
			@Override
			public void onClick(View v) {
				mBrowser.loadUrl("javascript:scrollPlayerCarToRight(1);");
			}
		});		
		
		mBtnLabel = (TextView)findViewById(R.id.label);
		
		mRunning = false;		
	}

	@Override
	protected void onPause()
	{
		super.onPause();

		unregisterReceiver(mIntentReceiver);
		
		ScoreloopManagerSingleton.get().setOnScoreSubmitObserver(null);
		
		if( mRunning && !mSubmit ) {
			mBrowser.loadUrl("javascript:togglePause();");
			mBtnLabel.setText(STR_START);
		}
	}

	@Override
	protected void onResume()
	{
		super.onResume();

		IntentFilter filter = new IntentFilter();
		filter.addAction(INTENT_SUBMIT_SCORE);
		registerReceiver(mIntentReceiver, filter);
		
		ScoreloopManagerSingleton.get().setOnScoreSubmitObserver(this);
		
		if( mDoRestart ) {
			mBrowser.loadUrl("javascript:doRestart();");
			mDoRestart = false;
			return;
		}
		
		if( mRunning && !mSubmit ) {
			mBrowser.loadUrl("javascript:togglePause();");
			mBtnLabel.setText(STR_PAUSE);
		}
	}
	
	@Override
	public boolean onKeyDown(int keyCode, KeyEvent event)
	{
		if( (keyCode == KeyEvent.KEYCODE_SEARCH) || (keyCode == KeyEvent.KEYCODE_DPAD_RIGHT) ) {
			mBrowser.loadUrl("javascript:scrollPlayerCarToRight(1);");
			return true;
		}

		if( (keyCode == KeyEvent.KEYCODE_MENU) || (keyCode == KeyEvent.KEYCODE_DPAD_LEFT) ) {
			mBrowser.loadUrl("javascript:scrollPlayerCarToLeft(1);");
			return true;
		}

		return super.onKeyDown( keyCode, event ); 
	}	

	@SuppressWarnings("deprecation")
	public void submitScore(int points)
	{
		mSubmit = true;
		showDialog(DLG_LOADING);
		
		ScoreloopManagerSingleton.get().onGamePlayEnded((double)points, null);		
	}
	
	@SuppressWarnings("deprecation")
	@Override
	public void onScoreSubmit(int status, Exception error)
	{
		dismissDialog(DLG_LOADING);
		
		mSubmitStatus = status;
		
		startActivityForResult(new Intent(this, ShowResultOverlayActivity.class), SHOW_RESULT);	
	}
	
	@Override
	protected void onActivityResult(final int requestCode, final int resultCode, final Intent data)
	{
		switch (requestCode) {
		case SHOW_RESULT:
			if ( mSubmitStatus != OnScoreSubmitObserver.STATUS_ERROR_NETWORK ) {
				startActivityForResult(new Intent(this, PostScoreOverlayActivity.class), POST_SCORE);
			} else {
				mDoRestart = true;
			}
			break;
		case POST_SCORE:
			mSubmit = false;
			mDoRestart = true;
			// onResume will be called
			break;
		default:
			break;
		}
	}
	
	public class AndroidInterface
	{
		protected Context mContext;
		
		AndroidInterface(Context ctx)
		{
			mContext = ctx;
		}
		
		public void submitScore(int score)
		{
			if( mContext != null ) {
				Intent intent = new Intent(INTENT_SUBMIT_SCORE);
				intent.putExtra("score", score);
				mContext.sendBroadcast(intent);
			}
		}
	}
	
	protected BroadcastReceiver mIntentReceiver = new BroadcastReceiver()
	{
		@Override
		public void onReceive(Context context, Intent intent)
		{
			String action = intent.getAction();
			
			if( action.equals(INTENT_SUBMIT_SCORE) ) {
				submitScore(intent.getExtras().getInt("score"));
			}
		}
	};
	
	@Override
	protected Dialog onCreateDialog(final int id)
	{
		if( id == DLG_LOADING ) {
			ProgressDialog dialog = new ProgressDialog(this);
			dialog.setCancelable(false);
			dialog.setMessage("Loading...");
			
			return dialog;
		}
		else {
			return null;
		}
	}
}