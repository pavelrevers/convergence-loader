var path = require('path');

var loaderUtils = require('loader-utils');

const OldDeps = require('enb-bem-techs/exlib/deps-old').OldDeps;
const Level = require('enb-bem-techs/lib/levels/level');
const Levels = require('enb-bem-techs/lib/levels/levels');

module.exports = function(source) {
    this.cacheable();
    var callback = this.async();
    var loaderOptions = loaderUtils.parseQuery(this.query);
    var file = loaderUtils.getRemainingRequest(this);
    var techs = loaderOptions.techs;
    var bemdecl = this.exec(source, this.resourcePath);
    var levels = new Levels(loaderOptions.levels.map(function (path) {
        var level = new Level(path);
        level.load();
        return level;
    }));

    new OldDeps(bemdecl.blocks || bemdecl.deps).expandByFS({levels: levels}).then(function (resolvedDeps) {
        var files = resolvedDeps.getDeps().map(function (dep) {
            if (dep.elem) {
                return levels.getElemFiles(dep.block, dep.elem, dep.mod, dep.val || '');
            } else {
                return levels.getBlockFiles(dep.block, dep.mod, dep.val || '');
            }
        });

        if (true) {
            var fs = require('fs');
            var fileName = file.split('.bemdecl.js')[0] + '.yate';

            fs.writeFileSync(fileName, files.map(generateIncludeStringFromEntity).join(''));
        }

        callback(null, files.map(generateRequireStringFromFilePath).join(''));
    }, function () {
        console.log(arguments);
    })
};

function generateRequireStringFromFilePath(all) {
    return all.reduce(function (string, file) {
        if (file.suffix === 'js' || file.suffix === 'css') {
            return string + "require('" + path.resolve(file.fullname) + "');";
        } else {
            return string;
        }
    }, '');
}

function generateIncludeStringFromEntity(all) {
    return all.reduce(function (string, file) {
        if (file.suffix === 'yate') {
            return string + 'include "' + path.resolve(file.fullname) + '"\n';
        } else {
            return string;
        }
    }, '');
}
