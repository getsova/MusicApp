import React from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, Text, Dimensions } from 'react-native';
import { WebView } from 'react-native-webview';

export default function YouTubePlayer({ visible, url, onClose }) {
    if (!visible || !url) return null;

    const getVideoId = (url) => {
        const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s?#]+)/);
        return match ? match[1] : null;
    };

    const videoId = getVideoId(url);
    const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : url;

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.container}>
                <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                    <Text style={styles.closeText}>×</Text>
                </TouchableOpacity>

                <View style={styles.webviewContainer}>
                    <WebView
                        source={{ uri: embedUrl }}
                        style={styles.webview}
                        javaScriptEnabled={true}
                        domStorageEnabled={true}
                    />
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgba(88, 6, 82, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeBtn: {
        position: 'absolute',
        top: 40,
        right: 20,
        backgroundColor: 'white',
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    closeText: {
        fontSize: 24,
        color: '#333',
        fontWeight: 'bold',
    },
    webviewContainer: {
        width: '100%',
        aspectRatio: 16 / 9,
        maxWidth: 640,
    },
    webview: {
        flex: 1,
    }
});
