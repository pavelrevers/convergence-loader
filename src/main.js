var path = require('path');

var loaderUtils = require('loader-utils');

var convergence = require('convergence');

module.exports = function(source) {
    this.cacheable();
    var callback = this.async();
    var loaderOptions = loaderUtils.parseQuery(this.query);
    var techs = loaderOptions.techs;

    convergence({
        decls: [
            loaderUtils.getRemainingRequest(this)
        ],
        levels: loaderOptions.levels
    })
        .then(
            function (data) {
                var jsString = '';
console.log(techs)
                if (techs.indexOf('yate') >= 0) {
                    console.log('2')
                    var fs = require('fs');
                    var fileName = loaderUtils.getRemainingRequest(this) + '.yate';

                    fs.writeSync(fileName, data.filter(function (b) {
                        return techs.indexOf('yate') >= 0;
                    }).map(generateIncludeStringFromEntity).join(''));
                }

                var jsString = data.filter(function (b) {
                    return techs.indexOf(b.tech) >= 0;
                }).map(generateRequireStringFromEntity).join('')

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
