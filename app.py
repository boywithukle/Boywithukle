from flask import Flask, jsonify, render_template
import yt_dlp
import random

app = Flask(__name__)

# URL of the YouTube playlist
PLAYLIST_URL = 'https://www.youtube.com/playlist?list=PLAKKzW5vKG4uwZ1LZUVc7rqrabiPEHklo'

# Function to fetch songs from the YouTube playlist
def fetch_songs_from_playlist():
    ydl_opts = {
        'quiet': True,
        'extract_flat': True,  # Only fetch metadata, don't download the songs
    }

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info_dict = ydl.extract_info(PLAYLIST_URL, download=False)
        videos = info_dict.get('entries', [])
        # Collect both video ID and title
        song_list = [{'id': video['id'], 'title': video['title']} for video in videos if 'id' in video and 'title' in video]
        return song_list

@app.route('/')
def index():
    return render_template('index.html')  # This will serve your main HTML page

@app.route('/songs')
def get_songs():
    # Fetch songs from the playlist
    songs = fetch_songs_from_playlist()

    # Choose a random song
    selected_song = random.choice(songs) if songs else None

    return jsonify({'songs': songs, 'selected_song': selected_song})

@app.route('/songs/<song_id>')
def get_song(song_id):
    ydl_opts = {
        'format': 'bestaudio/best',
        'quiet': True,
    }

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info_dict = ydl.extract_info(f'https://www.youtube.com/watch?v={song_id}', download=False)
        audio_url = info_dict['url']

    return jsonify({'audio_url': audio_url})

if __name__ == '__main__':
    app.run(debug=False, host='0.0.0.0')
