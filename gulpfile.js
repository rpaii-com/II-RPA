const gulp = require('gulp');
const path = require('path')
const createWindowsInstaller = require('electron-winstaller').createWindowsInstaller

gulp.task('default', function () {
    getInstallerConfig()
        .then(createWindowsInstaller)
        .catch((error) => {
            console.log(1)
            console.error(error.message || error)
            console.log(error)
            process.exit(1)
        })

    function getInstallerConfig() {
        const rootPath = path.join(__dirname, '/')
        const outPath = path.join(rootPath)
        console.log('creating windows installer')
        console.log(path.join(rootPath, '/OutApp/'), outPath, path.join(outPath, '/OutApp'))

        return Promise.resolve({
            appDirectory: path.join(rootPath, './OutApp/robot-win32-x64'),
            authors: 'Veintc',
            noMsi: true,
            outputDirectory: path.join(outPath, './OutApp/robot-designer'),
            exe: 'robot.exe',
            setupExe: 'robot.exe',
            // loadingGif: No
            // setupIcon: path.join(rootPath, 'app', 'img', 'icon.ico')
        })
    }
});