/*jslint todo: true, node: true, stupid: true, plusplus: true, continue: true */
"use strict";
var utils = {},
    spawn = require('child_process').spawn,
    mailer = require("./mailer"),
    config = require('./config');

utils.formatNodeInfo = function(node) {
  node.name = (node.name.toLowerCase() == 'diaspora*') ? node.host : node.name;
  var node_meta_tab = utils.get_node_network_and_version(node.network, node.version);
  node.network = node_meta_tab[0];
  node.version = node_meta_tab[1];
  node.registrations_open = (node.registrations_open) ? "Yes" : "No";
  if (node.active_users_halfyear == undefined) {
    node.active_users_halfyear = "-";
  }
  if (node.active_users_monthly == undefined) {
    node.active_users_monthly = "-";
  }
  if (node.total_users == undefined) {
    node.total_users = "-";
  }
  if (node.local_posts == undefined) {
    node.local_posts = "-";
  }
  if (node.local_comments == undefined) {
    node.local_comments = "-";
  }
  node.services = utils.services_string(node);
  return node;
}

utils.get_node_network_and_version = function(network, version) {
    /* Return an array that contains network and version
    by looking at network and version from node data. These are
    not always filled properly. */
    if (typeof network === 'undefined')
        network = 'unknown';
    try {
        switch (network.toLowerCase()) {
            case "friendica":
                return ["friendica", version];
            case "red matrix":
            case "redmatrix":
                return ["redmatrix", version];
            case "hubzilla":
            case "blablanet":  // See https://github.com/jaywink/the-federation.info/issues/38
                return ["hubzilla", version];
            case "pyaspora":
                return ["pyaspora", version];
            case "diaspora":
                if (version.indexOf('head') === 0) {
                    // development head, legacy
                    return ["diaspora", ".develop"];
                } else if (version.indexOf('-') > -1) {
                    // return version part only, no hash
                    return ["diaspora", version.split('-')[0]];
                } else {
                    // fallback, full version
                    return ["diaspora", version];
                }
            default:
                return ["unknown", version];
        }
    } catch (e) {
        utils.logger('utils', 'get_node_network_and_version', 'ERROR', e);
        return ["unknown", version];
    }
};

utils.logger = function(module, object, level, msg) {
    /* Output to console some standard formatted logging */
    console.log(new Date() + ' - [' + level + '] ' + module + '.' + object + ' | ' + msg);
};

utils.services_string = function(node) {
    /* Build a string for the Services column in the nodelist */
    var services = ["facebook", "twitter", "tumblr", "wordpress"];
    var service_keys = ["fb", "tw", "tu", "wp"];
    var enabled = [];
    for (var i = 0; i < services.length; i++) {
        if (node["service_" + services[i]] == 1) {
            enabled.push(service_keys[i]);
        }
    }
    return (enabled.length) ? enabled.join(',') : " ";
};

utils.syncActivePods = function () {
    /* Sync active pods list from diapod.net/active */
    var python = spawn('python', [ "-m", "src.tasks.sync_from_diapod_net" ]);
    python.stdout.on('data', function (data) {
        console.log('stdout: ' + data);
    });
    python.stderr.on('data', function (data) {
        console.log('stderr: ' + data);
    });
    python.on('close', function (code) {
        console.log("Result is " + code);
        if (code !== 0) {
            // Error from Python job, notify
            mailer.send_mail({
                from: 'do-not-reply@the-federation.info',
                to: config.admin.email,
                subject: '[warning] syncActivePods failed',
                text: 'The scheduled job syncActivePods failed with code: ' + code
            });
        }
    });
};

module.exports = utils;
