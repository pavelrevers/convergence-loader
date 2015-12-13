var path = require('path');

var loaderUtils = require('loader-utils');

var convergence = require('convergence');

module.exports = function(source) {
    this.cacheable();
    var callback = this.async();
    var loaderOptions = loaderUtils.parseQuery(this.query);
    var techs = loaderOptions.techs;
    var file = loaderUtils.getRemainingRequest(this);

    convergence({
        decls: [
            file
        ],
        levels: loaderOptions.levels
    })
        .then(
            function (data) {
                if (techs.indexOf('yate') >= 0) {
                    var fs = require('fs');
                    var fileName = file + '.yate';

                    fs.writeSync(fileName, data.filter(function (b) {
                        return b.tech === 'yate';
                    }).map(generateIncludeStringFromEntity).join(''));
                }

                callback(null, data.filter(function (b) {
                    return techs.indexOf(b.tech) >= 0;
                }).map(generateRequireStringFromEntity).join(''));
            },
            console.error
        );
};

function generateRequireStringFromEntity(entity) {
    return "require('" + path.resolve(entity.path) + "');\n";
}

function generateIncludeStringFromEntity(entity) {
    return 'include "' + path.resolve(entity.path) + '"\n';
}
