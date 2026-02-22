#!/usr/bin/env node

/**
 * Syncs shared web files from the desktop source to Android assets.
 *
 * Copies:  js/**, css/custom.css, assets/**
 * Skips:   libs/, index.html (Android has its own versions)
 */

const fs = require('fs');
const path = require('path');

const SRC = path.resolve(__dirname, '..', 'src', 'toddler_typing', 'web');
const DEST = path.resolve(__dirname, '..', 'android', 'app', 'src', 'main', 'assets', 'web');

let copied = 0;

function copyRecursive(srcDir, destDir) {
    if (!fs.existsSync(srcDir)) return;
    fs.mkdirSync(destDir, { recursive: true });

    for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
        const srcPath = path.join(srcDir, entry.name);
        const destPath = path.join(destDir, entry.name);

        if (entry.isDirectory()) {
            copyRecursive(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
            copied++;
        }
    }
}

// js/**
copyRecursive(path.join(SRC, 'js'), path.join(DEST, 'js'));

// css/custom.css
const cssSrc = path.join(SRC, 'css', 'custom.css');
if (fs.existsSync(cssSrc)) {
    fs.mkdirSync(path.join(DEST, 'css'), { recursive: true });
    fs.copyFileSync(cssSrc, path.join(DEST, 'css', 'custom.css'));
    copied++;
}

// assets/**
copyRecursive(path.join(SRC, 'assets'), path.join(DEST, 'assets'));

console.log(`Synced ${copied} files to android/app/src/main/assets/web/`);
