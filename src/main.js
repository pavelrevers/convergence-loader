var path = require('path');

var loaderUtils = require('loader-utils');

const bemdeclToFs = require('bemdecl-to-fs');

var bemDeps = require('@bem/deps');

module.exports = function(source) {
    this.cacheable();
    var callback = this.async();
    var loaderOptions = loaderUtils.parseQuery(this.query);
    var techs = loaderOptions.techs;
    var decl = this.exec(source, this.resourcePath).deps;
    var levels = loaderOptions.levels;

    getRelations(levels)
        .then(function (relations) {
            var res = bemDeps.resolve(decl, relations, { tech: techs });

            return bemdeclToFs(res.entities, levels, techs);
        })
        .then(function (files) {
            callback(null, files.map(generateRequireStringFromFilePath).join('\n'));
        }).catch(console.log);
};

function generateRequireStringFromFilePath(filePath) {
    return "require('" + path.resolve(filePath) + "');";
}

function generateIncludeStringFromEntity(entity) {
    return 'include "' + path.resolve(entity.path) + '"\n';
}

function getRelations(levels) {
    var stream = bemDeps.load({ levels: levels });

    return new Promise(function (resolve, reject) {
        // stream is already ended
        if (!stream.readable) return resolve([]);

        var arr = [];

        stream.on('data', onData);
        stream.on('end', onEnd);
        stream.on('error', onEnd);
        stream.on('close', onClose);

        function onData(doc) {
            arr.push(doc)
        }

        function onEnd(err) {
            if (err) reject(err);
            else resolve(arr);
            cleanup();
        }

        function onClose() {
            resolve(arr);
            cleanup();
        }

        function cleanup() {
            arr = null;
            stream.removeListener('data', onData);
            stream.removeListener('end', onEnd);
            stream.removeListener('error', onEnd);
            stream.removeListener('close', onClose);
        }
    }).catch(console.log)
}
