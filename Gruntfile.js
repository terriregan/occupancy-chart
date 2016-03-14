module.exports = function(grunt) {
    'use strict';

    // Loads tasks
    require('matchdep').filterDev("grunt-*").forEach(grunt.loadNpmTasks);

    grunt.initConfig({

        useminPrepare: {
            html: 'home.html'
        },

        usemin: {
            html: 'dist/home.html'
        },

        copy: {
            dist: {
                files: [{
                    src: 'home.html',
                    dest: 'dist/home.html'
                }, {
                    src: 'chart_data_test.json',
                    dest: 'dist/chart_data_test.json'
                }, {
                    src: 'chart_data_one.json',
                    dest: 'dist/chart_data_one.json'
                }]
            }
        },

        clean: {
            dist: {
                src: ['.tmp', 'dist', 'css/occupancy-chart.css']
            }
        },

        // Renames files for browser caching purposes
        filerev: {
            dist: {
                src: [
                    'dist/js/*.js',
                    'dist/css/*.css',
                    'dist/images/*.*'
                ]
            }
        },

        less: {
            options: {
                sourceMap: false,
                sourceMapEmbed: false,
                sourceMapContents: false
            },
            dist: {
                files: {
                    'css/occupancy-chart.css': 'css/occupancy-chart.less'
                }
            }
        },

        postcss: {
            options: {
                map: true,
                processors: [
                    // Add vendor prefixed styles
                    require('autoprefixer')({
                        browsers: ['> 1%', 'last 2 versions', 'Firefox ESR', 'Opera 12.1']
                    })
                ]
            },
            dist: {
                files: [{
                    expand: false,
                    src: 'css/occupancy-chart.css',
                    dest: 'css/occupancy-chart.css'
                }]
            }
        },

        watch: {
            less: {
                files: [ 
                    'css/occupancy-chart.less', 
                    'css/datepicker.less'
                ],
                tasks: ['less']
            }
        }
    });

    // Build
    grunt.registerTask('build', [
        'clean',
        'less',
        'postcss',
        'useminPrepare',
        'concat',
        'uglify',
        'cssmin',
        'copy',
        'filerev',
        'usemin'
    ]);

};
