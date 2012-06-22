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

import org.acra.ACRA;
import org.acra.ReportingInteractionMode;
import org.acra.annotation.ReportsCrashes;

import android.app.Application;

import com.scoreloop.client.android.ui.ScoreloopManagerSingleton;

@ReportsCrashes(
	formUri = "http://www.bugsense.com/api/acra?api_key=<redacted>"
	,formKey = ""
	,mode = ReportingInteractionMode.TOAST
	,resToastText = R.string.crash_report
)
public class LcdApplication extends Application
{
	@Override
	public void onCreate()
	{
		ACRA.init(this);

		super.onCreate();
		
		ScoreloopManagerSingleton.init(this, "<redacted>");
	}
	
	@Override
	public void onTerminate()
	{
		super.onTerminate();
		
		ScoreloopManagerSingleton.destroy();
	}	
}
