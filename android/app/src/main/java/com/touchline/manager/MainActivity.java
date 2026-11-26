package com.touchline.manager;

import android.app.Activity;
import android.graphics.Color;
import android.os.Bundle;
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
        setContentView(web);

        if (savedInstanceState != null) web.restoreState(savedInstanceState);
        else web.loadUrl("file:///android_asset/www/index.html");
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
