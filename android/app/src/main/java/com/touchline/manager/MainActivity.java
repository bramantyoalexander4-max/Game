package com.touchline.manager;

import android.app.Activity;
import android.graphics.Color;
import android.content.Context;
import android.os.Build;
import android.os.Bundle;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

/** Hosts the Touchline Manager web game in a full-screen WebView. */
public class MainActivity extends Activity {
    private WebView web;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().setStatusBarColor(Color.parseColor("#0F1A14"));
        getWindow().setNavigationBarColor(Color.parseColor("#0C150F"));

        web = new WebView(this);
        web.setBackgroundColor(Color.parseColor("#0F1A14"));
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);          // saves live in localStorage
        s.setDatabaseEnabled(true);
        s.setAllowFileAccess(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setTextZoom(100);                    // keep the layout as designed regardless of system font size
        web.setWebViewClient(new WebViewClient());
        web.setWebChromeClient(new WebChromeClient());
        web.addJavascriptInterface(new NativeBridge(), "TouchlineNative");
        setContentView(web);

        if (savedInstanceState != null) web.restoreState(savedInstanceState);
        else web.loadUrl("file:///android_asset/www/index.html");
    }

    /** Exposed to the game as window.TouchlineNative. */
    private class NativeBridge {
        /** patternJson: JSON array of ms, alternating vibrate/pause, e.g. [90,60,260]. */
        @JavascriptInterface
        public void vibrate(String patternJson) {
            try {
                Vibrator v = (Vibrator) getSystemService(Context.VIBRATOR_SERVICE);
                if (v == null || !v.hasVibrator()) return;
                String body = patternJson.replaceAll("[\\[\\]\\s]", "");
                if (body.isEmpty()) return;
                String[] parts = body.split(",");
                long[] timings = new long[parts.length + 1];   // leading 0 = start immediately
                for (int i = 0; i < parts.length; i++) timings[i + 1] = Math.max(0, Math.min(2000, Long.parseLong(parts[i])));
                if (Build.VERSION.SDK_INT >= 26) v.vibrate(VibrationEffect.createWaveform(timings, -1));
                else v.vibrate(timings, -1);
            } catch (Exception ignored) { }
        }
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        super.onSaveInstanceState(outState);
        web.saveState(outState);
    }

    @Override
    public void onBackPressed() {
        // close an open dialog in the game first; otherwise leave the app
        web.evaluateJavascript(
            "(function(){var m=document.getElementById('modal');" +
            "if(m&&!m.classList.contains('hidden')){m.classList.add('hidden');return 'closed';}return 'none';})()",
            value -> { if (!"\"closed\"".equals(value)) MainActivity.super.onBackPressed(); });
    }

    @Override
    protected void onPause() {
        super.onPause();
        web.onPause();
    }

    @Override
    protected void onResume() {
        super.onResume();
        web.onResume();
    }
}
