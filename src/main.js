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
                callback(null, data.filter(function (b) {
                    return techs.indexOf(b.tech) >= 0;
                }).map(generateRequireStringFromEntity).join(''));
            },
            console.error
        );
};

function generateRequireStringFromEntity(entity) {
    return "require('" + path.resolve(b.path) + "');\n";
}
