from flask import Flask, jsonify, send_from_directory, render_template
import os
import random

app = Flask(__name__)

# Set the directory where the MP3 files are stored
SONG_FOLDER = 'static/songs'

@app.route('/')
def index():
    return render_template('index.html')  # This will serve your main HTML page

@app.route('/songs')
def get_songs():
    # List all MP3 files in the folder
    songs = [f for f in os.listdir(SONG_FOLDER) if f.endswith('.mp3')]

    # Choose a random song
    selected_song = random.choice(songs) if songs else None

    return jsonify({'songs': songs, 'selected_song': selected_song})

@app.route('/songs/<filename>')
def get_song(filename):
    return send_from_directory(SONG_FOLDER, filename)

if __name__ == '__main__':
    app.run(debug=True)