/*jslint todo: true, node: true, stupid: true, plusplus: true, continue: true */
"use strict";
var utils = {},
    spawn = require('child_process').spawn,
    mailer = require("./mailer"),
    config = require('./config');

utils.formatPodInfo = function(pod) {
  pod.name = (pod.name.toLowerCase() == 'diaspora*') ? pod.host : pod.name;
  var pod_meta_tab = utils.get_pod_network_and_version(pod.network, pod.version);
  pod.network = pod_meta_tab[0];
  pod.version = pod_meta_tab[1];
  pod.registrations_open = (pod.registrations_open) ? "Yes" : "No";
  if (pod.active_users_halfyear == undefined) {
    pod.active_users_halfyear = "-";
  }
  if (pod.active_users_monthly == undefined) {
    pod.active_users_monthly = "-";
  }
  if (pod.total_users == undefined) {
    pod.total_users = "-";
  }
  if (pod.local_posts == undefined) {
    pod.local_posts = "-";
  }
  if (pod.local_comments == undefined) {
    pod.local_comments = "-";
  }
  pod.services = utils.services_string(pod);
  return pod;
}

utils.get_pod_network_and_version = function(network, version) {
    /* Return an array that contains network and version
    by looking at network and version from pod data. These are
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
        utils.logger('utils', 'get_pod_network_and_version', 'ERROR', e);
        return ["unknown", version];
    }
};

utils.logger = function(module, object, level, msg) {
    /* Output to console some standard formatted logging */
    console.log(new Date() + ' - [' + level + '] ' + module + '.' + object + ' | ' + msg);
};

utils.services_string = function(pod) {
    /* Build a string for the Services column in the podlist */
    var services = ["facebook", "twitter", "tumblr", "wordpress"];
    var service_keys = ["fb", "tw", "tu", "wp"];
    var enabled = [];
    for (var i = 0; i < services.length; i++) {
        if (pod["service_" + services[i]] == 1) {
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
