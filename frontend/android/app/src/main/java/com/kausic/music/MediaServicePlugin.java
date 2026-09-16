package com.kausic.music;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.os.Build;
import android.support.v4.media.MediaMetadataCompat;
import android.support.v4.media.session.MediaSessionCompat;
import android.support.v4.media.session.PlaybackStateCompat;

import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;
import androidx.media.app.NotificationCompat.MediaStyle;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;

@CapacitorPlugin(name = "KausicMedia")
public class MediaServicePlugin extends Plugin {
    private static final String CHANNEL_ID = "kausic_playback_v2";
    private static final int NOTIFICATION_ID = 2050;
    private static final String ACTION_PLAY_PAUSE = "com.kausic.music.ACTION_PLAY_PAUSE";
    private static final String ACTION_NEXT = "com.kausic.music.ACTION_NEXT";
    private static final String ACTION_PREV = "com.kausic.music.ACTION_PREV";

    private MediaSessionCompat mediaSession;
    private NotificationManagerCompat notificationManager;
    private boolean receiverRegistered = false;
    private String lastTitle = "KAUSIC";
    private String lastArtist = "Crystal Sound";
    private boolean lastIsPlaying = false;
    private Bitmap cachedArtwork = null;
    private String cachedArtworkUrl = null;

    private final BroadcastReceiver mediaReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            String action = intent.getAction();
            if (action == null) return;

            JSObject data = new JSObject();
            if (ACTION_PLAY_PAUSE.equals(action)) {
                data.put("action", "toggle");
                notifyListeners("mediaAction", data);
            } else if (ACTION_NEXT.equals(action)) {
                data.put("action", "next");
                notifyListeners("mediaAction", data);
            } else if (ACTION_PREV.equals(action)) {
                data.put("action", "prev");
                notifyListeners("mediaAction", data);
            }
        }
    };

    @Override
    public void load() {
        super.load();
        Context ctx = getContext();
        createNotificationChannel(ctx);
        notificationManager = NotificationManagerCompat.from(ctx);

        mediaSession = new MediaSessionCompat(ctx, "KausicMediaSession");
        mediaSession.setFlags(MediaSessionCompat.FLAG_HANDLES_MEDIA_BUTTONS | MediaSessionCompat.FLAG_HANDLES_TRANSPORT_CONTROLS);

        mediaSession.setCallback(new MediaSessionCompat.Callback() {
            @Override
            public void onPlay() {
                JSObject data = new JSObject();
                data.put("action", "play");
                notifyListeners("mediaAction", data);
            }

            @Override
            public void onPause() {
                JSObject data = new JSObject();
                data.put("action", "pause");
                notifyListeners("mediaAction", data);
            }

            @Override
            public void onSkipToNext() {
                JSObject data = new JSObject();
                data.put("action", "next");
                notifyListeners("mediaAction", data);
            }

            @Override
            public void onSkipToPrevious() {
                JSObject data = new JSObject();
                data.put("action", "prev");
                notifyListeners("mediaAction", data);
            }

            @Override
            public void onSeekTo(long pos) {
                JSObject data = new JSObject();
                data.put("action", "seek");
                data.put("position", pos / 1000.0);
                notifyListeners("mediaAction", data);
            }
        });

        mediaSession.setActive(true);

        IntentFilter filter = new IntentFilter();
        filter.addAction(ACTION_PLAY_PAUSE);
        filter.addAction(ACTION_NEXT);
        filter.addAction(ACTION_PREV);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            ctx.registerReceiver(mediaReceiver, filter, Context.RECEIVER_NOT_EXPORTED);
        } else {
            ctx.registerReceiver(mediaReceiver, filter);
        }
        receiverRegistered = true;
    }

    private void createNotificationChannel(Context ctx) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                    CHANNEL_ID,
                    "KAUSIC Music Playback",
                    NotificationManager.IMPORTANCE_LOW
            );
            channel.setDescription("Shows active playback controls on lock screen and notification shade");
            channel.setShowBadge(false);
            channel.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);
            NotificationManager nm = ctx.getSystemService(NotificationManager.class);
            if (nm != null) {
                nm.createNotificationChannel(channel);
            }
        }
    }

    @PluginMethod
    public void update(PluginCall call) {
        String title = call.getString("title", "KAUSIC Music");
        String artist = call.getString("artist", "Crystal Sound System");
        String album = call.getString("album", "Designed by Kaushik");
        String artworkUrl = call.getString("artworkUrl", "");
        boolean isPlaying = Boolean.TRUE.equals(call.getBoolean("isPlaying", false));
        double duration = call.getDouble("duration", 0.0);
        double position = call.getDouble("position", 0.0);

        this.lastTitle = title;
        this.lastArtist = artist;
        this.lastIsPlaying = isPlaying;

        // Update MediaSession state
        long actions = PlaybackStateCompat.ACTION_PLAY |
                       PlaybackStateCompat.ACTION_PAUSE |
                       PlaybackStateCompat.ACTION_PLAY_PAUSE |
                       PlaybackStateCompat.ACTION_SKIP_TO_NEXT |
                       PlaybackStateCompat.ACTION_SKIP_TO_PREVIOUS |
                       PlaybackStateCompat.ACTION_SEEK_TO;

        int state = isPlaying ? PlaybackStateCompat.STATE_PLAYING : PlaybackStateCompat.STATE_PAUSED;
        PlaybackStateCompat.Builder stateBuilder = new PlaybackStateCompat.Builder()
                .setActions(actions)
                .setState(state, (long) (position * 1000), 1.0f);
        mediaSession.setPlaybackState(stateBuilder.build());

        // Update MediaMetadata
        MediaMetadataCompat.Builder metaBuilder = new MediaMetadataCompat.Builder()
                .putString(MediaMetadataCompat.METADATA_KEY_TITLE, title)
                .putString(MediaMetadataCompat.METADATA_KEY_ARTIST, artist)
                .putString(MediaMetadataCompat.METADATA_KEY_ALBUM, album)
                .putLong(MediaMetadataCompat.METADATA_KEY_DURATION, (long) (duration * 1000));

        // Asynchronously load artwork if needed
        if (artworkUrl != null && !artworkUrl.isEmpty() && !artworkUrl.equals(cachedArtworkUrl)) {
            cachedArtworkUrl = artworkUrl;
            new Thread(() -> {
                try {
                    URL url = new URL(artworkUrl);
                    HttpURLConnection connection = (HttpURLConnection) url.openConnection();
                    connection.setDoInput(true);
                    connection.connect();
                    InputStream input = connection.getInputStream();
                    cachedArtwork = BitmapFactory.decodeStream(input);
                } catch (Exception ignored) {
                    cachedArtwork = null;
                }
                postNotification(title, artist, isPlaying, cachedArtwork);
            }).start();
        } else {
            postNotification(title, artist, isPlaying, cachedArtwork);
        }

        call.resolve();
    }

    private void postNotification(String title, String artist, boolean isPlaying, Bitmap artwork) {
        Context ctx = getContext();
        if (ctx == null) return;

        Intent contentIntent = new Intent(ctx, MainActivity.class);
        contentIntent.setFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent contentPI = PendingIntent.getActivity(
                ctx, 0, contentIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        PendingIntent prevPI = PendingIntent.getBroadcast(
                ctx, 1, new Intent(ACTION_PREV), PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
        PendingIntent playPausePI = PendingIntent.getBroadcast(
                ctx, 2, new Intent(ACTION_PLAY_PAUSE), PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
        PendingIntent nextPI = PendingIntent.getBroadcast(
                ctx, 3, new Intent(ACTION_NEXT), PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        int playPauseIcon = isPlaying ? android.R.drawable.ic_media_pause : android.R.drawable.ic_media_play;
        String playPauseTitle = isPlaying ? "Pause" : "Play";

        NotificationCompat.Builder builder = new NotificationCompat.Builder(ctx, CHANNEL_ID)
                .setSmallIcon(android.R.drawable.ic_media_play)
                .setContentTitle(title)
                .setContentText(artist)
                .setSubText("KAUSIC")
                .setContentIntent(contentPI)
                .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
                .setPriority(NotificationCompat.PRIORITY_LOW)
                .setOngoing(isPlaying)
                .addAction(android.R.drawable.ic_media_previous, "Previous", prevPI)
                .addAction(playPauseIcon, playPauseTitle, playPausePI)
                .addAction(android.R.drawable.ic_media_next, "Next", nextPI)
                .setStyle(new MediaStyle()
                        .setMediaSession(mediaSession.getSessionToken())
                        .setShowActionsInCompactView(0, 1, 2)
                );

        if (artwork != null) {
            builder.setLargeIcon(artwork);
        }

        try {
            notificationManager.notify(NOTIFICATION_ID, builder.build());
        } catch (SecurityException ignored) {
            // Android 13 notification permission check
        }
    }

    @PluginMethod
    public void clear(PluginCall call) {
        if (notificationManager != null) {
            notificationManager.cancel(NOTIFICATION_ID);
        }
        if (mediaSession != null) {
            mediaSession.setActive(false);
        }
        call.resolve();
    }

    @Override
    protected void handleOnDestroy() {
        super.handleOnDestroy();
        if (receiverRegistered) {
            try {
                getContext().unregisterReceiver(mediaReceiver);
            } catch (Exception ignored) {}
            receiverRegistered = false;
        }
        if (notificationManager != null) {
            notificationManager.cancel(NOTIFICATION_ID);
        }
        if (mediaSession != null) {
            mediaSession.release();
        }
    }
}
