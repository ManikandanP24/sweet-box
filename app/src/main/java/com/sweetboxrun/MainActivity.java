package com.sweetboxrun;
import android.app.Activity;
import android.os.Bundle;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

// Sweet Box Run Android WebView shell
public class MainActivity extends Activity {
  private WebView webView;
  @Override public void onCreate(Bundle state) {
    super.onCreate(state);
    requestWindowFeature(Window.FEATURE_NO_TITLE);
    getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN, WindowManager.LayoutParams.FLAG_FULLSCREEN);
    getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
    webView = new WebView(this);
    webView.setBackgroundColor(0xffb8d7df);
    WebSettings settings = webView.getSettings();
    settings.setJavaScriptEnabled(true);
    settings.setDomStorageEnabled(true);
    settings.setAllowFileAccess(true);
    settings.setAllowFileAccessFromFileURLs(true);
    settings.setMediaPlaybackRequiresUserGesture(false);
    webView.setWebViewClient(new WebViewClient());
    webView.setWebChromeClient(new WebChromeClient());
    webView.setOverScrollMode(View.OVER_SCROLL_NEVER);
    webView.loadUrl("file:///android_asset/index.html");
    setContentView(webView);
    hideSystemUI();
  }
  private void hideSystemUI() { getWindow().getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY | View.SYSTEM_UI_FLAG_FULLSCREEN | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION | View.SYSTEM_UI_FLAG_LAYOUT_STABLE); }
  @Override public void onWindowFocusChanged(boolean hasFocus) { super.onWindowFocusChanged(hasFocus); if(hasFocus) hideSystemUI(); }
  @Override public void onBackPressed() { if(webView!=null && webView.canGoBack()) webView.goBack(); else super.onBackPressed(); }
}