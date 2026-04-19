#!/usr/bin/env node
/*
 * Expo prebuild sonrası android/build.gradle ve android/gradle wrapper için gerekli
 * tek seferlik yamaları uygular.
 * - Gradle wrapper: Gradle 9.0 şu an Expo ile uyumlu değil, 8.13'e düşürür.
 * - @react-native-async-storage/async-storage 3.x için gerekli yerel maven repo
 *   girdisini ekler (Maven Central'da yayımlanmadığı için).
 */
const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const androidRoot = path.join(projectRoot, 'android');

function replaceInFile(file, transform) {
  if (!fs.existsSync(file)) {
    console.error(`[patch-android] ${file} bulunamadı`);
    return false;
  }
  const src = fs.readFileSync(file, 'utf8');
  const next = transform(src);
  if (src !== next) {
    fs.writeFileSync(file, next);
    console.log(`[patch-android] yamalandı: ${path.relative(projectRoot, file)}`);
    return true;
  }
  return false;
}

const wrapperFile = path.join(
  androidRoot,
  'gradle',
  'wrapper',
  'gradle-wrapper.properties',
);
replaceInFile(wrapperFile, (src) =>
  src.replace(/gradle-9\.0(?:\.\d+)?-bin\.zip/g, 'gradle-8.13-bin.zip'),
);

const rootBuildGradle = path.join(androidRoot, 'build.gradle');
replaceInFile(rootBuildGradle, (src) => {
  if (src.includes('react-native-async-storage_async-storage')) return src;
  const marker = 'allprojects {';
  const injection = `allprojects {
    repositories {
        maven {
            url = uri(project(":react-native-async-storage_async-storage").file("local_repo"))
        }
    }
`;
  const idx = src.indexOf(marker);
  if (idx === -1) {
    console.warn('[patch-android] allprojects bloğu bulunamadı, ekleniyor');
    return (
      src +
      '\n' +
      injection +
      '}\n'
    );
  }
  return src.slice(0, idx) + injection + src.slice(idx + marker.length);
});

console.log('[patch-android] tamam');
