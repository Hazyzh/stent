(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.stent = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

exports.__esModule = true;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

// errors
var ERROR_MISSING_MACHINE = exports.ERROR_MISSING_MACHINE = function ERROR_MISSING_MACHINE(name) {
  return 'There\'s no machine with name ' + name;
};
var ERROR_MISSING_STATE = exports.ERROR_MISSING_STATE = 'Configuration error: missing initial "state"';
var ERROR_MISSING_TRANSITIONS = exports.ERROR_MISSING_TRANSITIONS = 'Configuration error: missing "transitions"';
var ERROR_WRONG_STATE_FORMAT = exports.ERROR_WRONG_STATE_FORMAT = function ERROR_WRONG_STATE_FORMAT(state) {
  var serialized = (typeof state === 'undefined' ? 'undefined' : _typeof(state)) === 'object' ? JSON.stringify(state, null, 2) : state;

  return 'The state should be an object and it should always have at least "name" property. You passed ' + serialized;
};
var ERROR_UNCOVERED_STATE = exports.ERROR_UNCOVERED_STATE = function ERROR_UNCOVERED_STATE(state) {
  return 'You just transitioned the machine to a state (' + state + ') which is not defined or it has no actions. This means that the machine is stuck.';
};
var ERROR_NOT_SUPPORTED_HANDLER_TYPE = exports.ERROR_NOT_SUPPORTED_HANDLER_TYPE = 'Wrong handler type passed. Please read the docs https://github.com/krasimir/stent';
// If we decide to run stent in a strict mode where dispatching an action missing in the current state
// dispatches an error.
// export const ERROR_MISSING_ACTION_IN_STATE = (action, state, payload = '') => {
//   const payloadInfo = payload !== '' ? ` Payload of the action: ${ payload }` : '';

//   return `"${ action }" action is not available in "${ state }" state.${ payloadInfo }`;
// }

// other
var WAIT_LISTENERS_STORAGE = exports.WAIT_LISTENERS_STORAGE = '___@wait';
},{}],2:[function(require,module,exports){
'use strict';

exports.__esModule = true;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.registerMethods = registerMethods;
exports.validateConfig = validateConfig;
exports.default = createMachine;

var _toCamelCase = require('./helpers/toCamelCase');

var _toCamelCase2 = _interopRequireDefault(_toCamelCase);

var _constants = require('./constants');

var _handleAction = require('./handleAction');

var _handleAction2 = _interopRequireDefault(_handleAction);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var IDX = 0;
var getMachineID = function getMachineID() {
  return '_' + ++IDX;
};

function registerMethods(machine, transitions, dispatch) {
  for (var state in transitions) {

    (function (state) {
      machine[(0, _toCamelCase2.default)('is ' + state)] = function () {
        return machine.state.name === state;
      };
    })(state);

    for (var action in transitions[state]) {
      (function (action) {
        machine[(0, _toCamelCase2.default)(action)] = function () {
          for (var _len = arguments.length, payload = Array(_len), _key = 0; _key < _len; _key++) {
            payload[_key] = arguments[_key];
          }

          return dispatch.apply(undefined, [action].concat(payload));
        };
      })(action);
    }
  }
}

function validateConfig(config) {
  if ((typeof config === 'undefined' ? 'undefined' : _typeof(config)) !== 'object') throw new Error(_constants.ERROR_MISSING_STATE);

  var state = config.state,
      transitions = config.transitions;


  if ((typeof state === 'undefined' ? 'undefined' : _typeof(state)) !== 'object') throw new Error(_constants.ERROR_MISSING_STATE);
  if ((typeof transitions === 'undefined' ? 'undefined' : _typeof(transitions)) !== 'object') throw new Error(_constants.ERROR_MISSING_TRANSITIONS);
  return true;
}

function createMachine(name, config) {
  if ((typeof name === 'undefined' ? 'undefined' : _typeof(name)) === 'object') {
    if (typeof config === 'undefined') {
      config = name;
      name = getMachineID();
    } else {
      config = {
        state: name,
        transitions: config
      };
      name = getMachineID();
    }
  }

  var machine = { name: name };

  validateConfig(config);

  var _config = config,
      initialState = _config.state,
      transitions = _config.transitions;


  machine.state = initialState;
  machine.transitions = transitions;

  registerMethods(machine, transitions, function (action) {
    for (var _len2 = arguments.length, payload = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
      payload[_key2 - 1] = arguments[_key2];
    }

    return _handleAction2.default.apply(undefined, [machine, action].concat(payload));
  });

  return machine;
}
},{"./constants":1,"./handleAction":3,"./helpers/toCamelCase":5}],3:[function(require,module,exports){
'use strict';

exports.__esModule = true;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.default = handleAction;

var _constants = require('./constants');

var _validateState = require('./helpers/validateState');

var _validateState2 = _interopRequireDefault(_validateState);

var _ = require('./');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var MIDDLEWARE_PROCESS_ACTION = 'onActionDispatched';
var MIDDLEWARE_PROCESS_STATE_CHANGE = 'onStateChanged';
var MIDDLEWARE_GENERATOR_STEP = 'onGeneratorStep';

function isEmptyObject(obj) {
  var name;
  for (name in obj) {
    if (obj.hasOwnProperty(name)) return false;
  }
  return true;
}

function handleGenerator(machine, generator, done, resultOfPreviousOperation) {
  var iterate = function iterate(result) {
    handleMiddleware(function () {
      if (!result.done) {

        // yield call
        if (_typeof(result.value) === 'object' && result.value.__type === 'call') {
          var _result$value = result.value,
              func = _result$value.func,
              args = _result$value.args;

          var funcResult = func.apply(machine, args);

          // promise
          if (typeof funcResult.then !== 'undefined') {
            funcResult.then(function (result) {
              return iterate(generator.next(result));
            }, function (error) {
              return iterate(generator.throw(error));
            });
            // generator
          } else if (typeof funcResult.next === 'function') {
            handleGenerator(machine, funcResult, function (generatorResult) {
              iterate(generator.next(generatorResult));
            });
          } else {
            iterate(generator.next(funcResult));
          }

          // yield wait
        } else if (_typeof(result.value) === 'object' && result.value.__type === 'wait') {
          waitFor(machine, result.value.actions, function (result) {
            return iterate(generator.next(result));
          });

          // a return statement of the normal function
        } else {
          updateState(machine, result.value);
          iterate(generator.next());
        }

        // the end of the generator (return statement)
      } else {
        done(result.value);
      }
    }, MIDDLEWARE_GENERATOR_STEP, machine, result.value);
  };

  iterate(generator.next(resultOfPreviousOperation));
}

function waitFor(machine, actions, done) {
  if (!machine[_constants.WAIT_LISTENERS_STORAGE]) machine[_constants.WAIT_LISTENERS_STORAGE] = [];
  machine[_constants.WAIT_LISTENERS_STORAGE].push({ actions: actions, done: done, result: [].concat(actions) });
}

// The wait of how `wait` is implemented is that we store listeners
// in machine[WAIT_LISTENERS_STORAGE]. Every time when we dispatch an action
// we are trying to flush these listeners. Once there are no more in the current
// item we are calling `next` function of the generator.
function flushListeners(machine, action) {
  for (var _len = arguments.length, payload = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
    payload[_key - 2] = arguments[_key];
  }

  if (!machine[_constants.WAIT_LISTENERS_STORAGE] || machine[_constants.WAIT_LISTENERS_STORAGE].length === 0) return;

  // We register the `done` functions that should be called
  // because this should happen at the very end of the
  // listeners processing.
  var callbacks = [];

  machine[_constants.WAIT_LISTENERS_STORAGE] = machine[_constants.WAIT_LISTENERS_STORAGE].filter(function (_ref) {
    var actions = _ref.actions,
        done = _ref.done,
        result = _ref.result;

    var actionIndex = actions.indexOf(action);

    if (actionIndex === -1) return true;

    // Result here is an array that acts as a marker
    // to find out at which index we have to return the payload
    // of the action. That's when we have an array of actions to wait.
    result[result.indexOf(action)] = payload;
    actions.splice(actionIndex, 1);
    if (actions.length === 0) {
      result.length === 1 ? callbacks.push(done.bind(null, result[0])) : callbacks.push(done.bind(null, result));
      return false;
    }
    return true;
  });
  callbacks.forEach(function (c) {
    return c();
  });

  // Clean up. There is no need to keep that temporary array
  // if all the listeners are flushed out.
  if (machine[_constants.WAIT_LISTENERS_STORAGE].length === 0) delete machine[_constants.WAIT_LISTENERS_STORAGE];
}

function updateState(machine, response) {
  var newState;

  if (typeof response === 'undefined') return;
  if (typeof response === 'string' || typeof response === 'number') {
    newState = { name: response.toString() };
  } else {
    newState = (0, _validateState2.default)(response);
  }

  if (typeof machine.transitions[newState.name] === 'undefined' || isEmptyObject(machine.transitions[newState.name])) {
    throw new Error((0, _constants.ERROR_UNCOVERED_STATE)(newState.name));
  }

  handleMiddleware(function () {
    machine.state = newState;
  }, MIDDLEWARE_PROCESS_STATE_CHANGE, machine);
}

function handleMiddleware(done, hook, machine) {
  for (var _len2 = arguments.length, args = Array(_len2 > 3 ? _len2 - 3 : 0), _key2 = 3; _key2 < _len2; _key2++) {
    args[_key2 - 3] = arguments[_key2];
  }

  var middlewares = _.Machine.middlewares;

  if (middlewares.length === 0) return done();

  var loop = function loop(index, process) {
    return index < middlewares.length - 1 ? process(index + 1) : done();
  };

  (function process(index) {
    var middleware = middlewares[index];

    if (middleware && typeof middleware[hook] !== 'undefined') {
      middleware[hook].apply(machine, [function () {
        return loop(index, process);
      }].concat(args));
    } else {
      loop(index, process);
    }
  })(0);
}

function handleAction(machine, action) {
  for (var _len3 = arguments.length, payload = Array(_len3 > 2 ? _len3 - 2 : 0), _key3 = 2; _key3 < _len3; _key3++) {
    payload[_key3 - 2] = arguments[_key3];
  }

  var state = machine.state,
      transitions = machine.transitions;


  if (!transitions[state.name]) {
    return false;
  }

  var handler = transitions[state.name][action];

  if (typeof transitions[state.name][action] === 'undefined') {
    // Maybe run the machine in a strict mode where dispatching an action
    // which is missing in the current state throws an error
    // throw new Error(ERROR_MISSING_ACTION_IN_STATE(action, state.name, payload.join(',')));
    return false;
  }

  handleMiddleware.apply(undefined, [function () {
    flushListeners.apply(undefined, [machine, action].concat(payload));

    // string as a handler
    if (typeof handler === 'string') {
      updateState(machine, _extends({}, state, { name: transitions[state.name][action] }));

      // object as a handler
    } else if ((typeof handler === 'undefined' ? 'undefined' : _typeof(handler)) === 'object') {
      updateState(machine, (0, _validateState2.default)(handler));

      // function as a handler
    } else if (typeof handler === 'function') {
      var response = transitions[state.name][action].apply(machine, [machine.state].concat(payload));

      if (response && typeof response.next === 'function') {
        handleGenerator(machine, response, function (response) {
          updateState(machine, response);
        });
      } else {
        updateState(machine, response);
      }

      // wrong type of handler
    } else {
      throw new Error(_constants.ERROR_NOT_SUPPORTED_HANDLER_TYPE);
    }
  }, MIDDLEWARE_PROCESS_ACTION, machine, action].concat(payload));

  return true;
};
module.exports = exports['default'];
},{"./":7,"./constants":1,"./helpers/validateState":6}],4:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports.flush = flush;
exports.default = connect;

var _ = require('../');

var idIndex = 0;
var mappings = null;

var getId = function getId() {
  return 'm' + ++idIndex;
};
var setup = function setup() {
  if (mappings !== null) return;
  mappings = {};
  _.Machine.addMiddleware({
    onStateChanged: function onStateChanged(next) {
      next();
      for (var id in mappings) {
        var _mappings$id = mappings[id],
            done = _mappings$id.done,
            machines = _mappings$id.machines;


        if (machines.map(function (m) {
          return m.name;
        }).indexOf(this.name) >= 0) {
          done && done.apply(undefined, machines);
        }
      }
    }
  });
};

function flush() {
  mappings = null;
}

function connect() {
  setup();
  var withFunc = function withFunc() {
    for (var _len = arguments.length, names = Array(_len), _key = 0; _key < _len; _key++) {
      names[_key] = arguments[_key];
    }

    var machines = names.map(function (name) {
      return _.Machine.get(name);
    });
    var mapFunc = function mapFunc(done, once, silent) {
      var id = getId();

      !once && (mappings[id] = { done: done, machines: machines });
      !silent && done && done.apply(undefined, machines);

      return function disconnect() {
        if (mappings && mappings[id]) delete mappings[id];
      };
    };

    return {
      'map': mapFunc,
      'mapOnce': function mapOnce(done) {
        return mapFunc(done, true);
      },
      'mapSilent': function mapSilent(done) {
        return mapFunc(done, false, true);
      }
    };
  };

  return { 'with': withFunc };
}
},{"../":7}],5:[function(require,module,exports){
"use strict";

exports.__esModule = true;

exports.default = function (text) {
  return text.toLowerCase().replace(/\W+(.)/g, function (match, chr) {
    return chr.toUpperCase();
  });
};

module.exports = exports['default'];
},{}],6:[function(require,module,exports){
'use strict';

exports.__esModule = true;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.default = validateState;

var _constants = require('../constants');

function validateState(state) {
  if (state && (typeof state === 'undefined' ? 'undefined' : _typeof(state)) === 'object' && typeof state.name !== 'undefined') return state;
  throw new Error((0, _constants.ERROR_WRONG_STATE_FORMAT)(state));
}
module.exports = exports['default'];
},{"../constants":1}],7:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports.Machine = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createMachine = require('./createMachine');

var _createMachine2 = _interopRequireDefault(_createMachine);

var _constants = require('./constants');

var _connect = require('./helpers/connect');

var _connect2 = _interopRequireDefault(_connect);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MachineFactory = function () {
  function MachineFactory() {
    _classCallCheck(this, MachineFactory);

    this.machines = {};
    this.middlewares = [];
    this.connect = _connect2.default;
  }

  MachineFactory.prototype.create = function create(name, config) {
    var machine = (0, _createMachine2.default)(name, config, this.middlewares);

    return this.machines[machine.name] = machine;
  };

  MachineFactory.prototype.get = function get(name) {
    if ((typeof name === 'undefined' ? 'undefined' : _typeof(name)) === 'object') name = name.name;
    if (this.machines[name]) return this.machines[name];
    throw new Error((0, _constants.ERROR_MISSING_MACHINE)(name));
  };

  MachineFactory.prototype.flush = function flush() {
    this.machines = [];
    this.middlewares = [];
    (0, _connect.flush)();
  };

  MachineFactory.prototype.addMiddleware = function addMiddleware(middleware) {
    if (Array.isArray(middleware)) {
      this.middlewares = this.middlewares.concat(middleware);
    } else {
      this.middlewares.push(middleware);
    }
  };

  return MachineFactory;
}();

var factory = new MachineFactory();

exports.Machine = factory;
},{"./constants":1,"./createMachine":2,"./helpers/connect":4}]},{},[7])(7)
});