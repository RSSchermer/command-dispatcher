describe("rlCommandDispatcher", function() {
  var cdProvider, cdService;
  
  beforeEach(function () {
    angular.module('rlCommandDispatcher.test', ['rlCommandDispatcher'])
      .config(function (commandDispatcherProvider) {
        cdProvider = commandDispatcherProvider;
      });
    
    angular.mock.module('rlCommandDispatcher', 'rlCommandDispatcher.test');
    
    angular.mock.inject(function($injector) {
      cdService = $injector.invoke(cdProvider.$get);
    });
  });
  
  describe('provider', function () {
    it('should throw an error on command without execute method', function () {
      expect(function () {
        cdProvider.registerCommand('someCommand', {
          someMethod: function () {}
        });
      }).toThrow("Command must have an 'execute' method.");
    });
    
    it('should throw an error on listener without notify method', function () {
      expect(function () {
        cdProvider.registerListener('beforeExecute', 'someCommand', {
          someMethod: function () {}
        });
      }).toThrow("Listener must have a 'notify' method.");
    });
    
    it('should throw an error on unsupported listener type', function () {
      expect(function () {
        cdProvider.registerListener('unsupportedListenerType', 'someCommand', {
          notify: function () {}
        });
      }).toThrow('"unsupportedListenerType" is an unsupported listener type.');
    });
  });
  
  describe('service', function () {
    it('should call the commands execute method on dispatch', function () {
      var command = {
        name: null,
  
        execute: function () {
          console.log('Hello '+ this.name || 'World' + '!');
        }
      };
      
      spyOn(command, 'execute');
      
      cdProvider.registerCommand('sayHello', command);
      cdService.dispatch('sayHello');
      
      expect(command.execute).toHaveBeenCalled();
    });
    
    it('should call the commands initialize method when defined', function () {
      var command = {
        name: null,
        
        initialize: function () {
          this.name = 'Bob';
        },
        
        execute: function () {
          console.log('Hello '+ this.name || 'World' + '!');
        }
      };
      
      spyOn(command, 'initialize');
      
      cdProvider.registerCommand('sayHello', command);
      cdService.dispatch('sayHello');
      
      expect(command.initialize).toHaveBeenCalled();
    });
    
    it('should pass a paramater hash to the initialize method', function () {
      var command = {
        name: null,
        
        initialize: function (params) {
          this.name = params.name;
        },
        
        execute: function () {
          console.log('Hello '+ this.name || 'World' + '!');
        }
      };
      
      spyOn(command, 'initialize');
      
      cdProvider.registerCommand('sayHello', command);
      cdService.dispatch('sayHello', {name: 'Bob'});
      
      expect(command.initialize).toHaveBeenCalledWith({name: 'Bob'});
    });
    
    it('should not call an initialize listener when there is no initiaze method on the command', function () {
      cdProvider.registerCommand('someCommand', {
        execute: function () {}
      });
      
      var beforeInitializeListener = {
        notify: function () {}
      };
      
      var afterInitializeListener = {
        notify: function () {}
      };
      
      cdProvider.registerListener('beforeInitialize', 'someCommand', beforeInitializeListener);
      cdProvider.registerListener('beforeInitialize', 'someCommand', afterInitializeListener);
      
      spyOn(beforeInitializeListener, 'notify');
      spyOn(afterInitializeListener, 'notify');
      
      cdService.dispatch('someCommand');
      
      expect(beforeInitializeListener.notify).not.toHaveBeenCalled();
      expect(afterInitializeListener.notify).not.toHaveBeenCalled();
    });
    
    it('should call all before-initialize listeners when there is an initialize command', function () {
      cdProvider.registerCommand('someCommand', {
        initialize: function () {},
        
        execute: function () {}
      });
      
      var beforeInitializeListener = {
        notify: function () {}
      };
      
      var otherBeforeInitializeListener = {
        notify: function () {}
      };
      
      cdProvider.registerListener('beforeInitialize', 'someCommand', beforeInitializeListener);
      cdProvider.registerListener('beforeInitialize', 'someCommand', otherBeforeInitializeListener);
      
      spyOn(beforeInitializeListener, 'notify');
      spyOn(otherBeforeInitializeListener, 'notify');
      
      cdService.dispatch('someCommand');
      
      expect(beforeInitializeListener.notify).toHaveBeenCalled();
      expect(otherBeforeInitializeListener.notify).toHaveBeenCalled();
    });
    
    it('should call all after-initialize listeners when there is an initialize command', function () {
      cdProvider.registerCommand('someCommand', {
        initialize: function () {},
        
        execute: function () {}
      });
      
      var afterInitializeListener = {
        notify: function () {}
      };
      
      var otherAfterInitializeListener = {
        notify: function () {}
      };
      
      cdProvider.registerListener('afterInitialize', 'someCommand', afterInitializeListener);
      cdProvider.registerListener('afterInitialize', 'someCommand', otherAfterInitializeListener);
      
      spyOn(afterInitializeListener, 'notify');
      spyOn(otherAfterInitializeListener, 'notify');
      
      cdService.dispatch('someCommand');
      
      expect(afterInitializeListener.notify).toHaveBeenCalled();
      expect(otherAfterInitializeListener.notify).toHaveBeenCalled();
    });
    
    it('should call all before-execute listeners', function () {
      cdProvider.registerCommand('someCommand', {
        execute: function () {}
      });
      
      var beforeExecuteListener = {
        notify: function () {}
      };
      
      var otherBeforeExecuteListener = {
        notify: function () {}
      };
      
      cdProvider.registerListener('beforeExecute', 'someCommand', beforeExecuteListener);
      cdProvider.registerListener('beforeExecute', 'someCommand', otherBeforeExecuteListener);
      
      spyOn(beforeExecuteListener, 'notify');
      spyOn(otherBeforeExecuteListener, 'notify');
      
      cdService.dispatch('someCommand');
      
      expect(beforeExecuteListener.notify).toHaveBeenCalled();
      expect(otherBeforeExecuteListener.notify).toHaveBeenCalled();
    });
    
    it('should call all after-execute listeners', function () {
      cdProvider.registerCommand('someCommand', {
        execute: function () {}
      });
      
      var afterExecuteListener = {
        notify: function () {}
      };
      
      var otherAfterExecuteListener = {
        notify: function () {}
      };
      
      cdProvider.registerListener('afterExecute', 'someCommand', afterExecuteListener);
      cdProvider.registerListener('afterExecute', 'someCommand', otherAfterExecuteListener);
      
      spyOn(afterExecuteListener, 'notify');
      spyOn(otherAfterExecuteListener, 'notify');
      
      cdService.dispatch('someCommand');
      
      expect(afterExecuteListener.notify).toHaveBeenCalled();
      expect(otherAfterExecuteListener.notify).toHaveBeenCalled();
    });
    
    it('should pass the command, the listener type and the command name to listeners', function () {
      var command = {
        initialize: function () {},
        
        execute: function () {}
      };
      
      cdProvider.registerCommand('someCommand', command);
      
      var beforeInitializeListener = {
        notify: function () {}
      };
      
      var afterInitializeListener = {
        notify: function () {}
      };
      
      var beforeExecuteListener = {
        notify: function () {}
      };
      
      var afterExecuteListener = {
        notify: function () {}
      };
      
      cdProvider.registerListener('beforeInitialize', 'someCommand', beforeInitializeListener);
      cdProvider.registerListener('afterInitialize', 'someCommand', afterInitializeListener);
      cdProvider.registerListener('beforeExecute', 'someCommand', beforeExecuteListener);
      cdProvider.registerListener('afterExecute', 'someCommand', afterExecuteListener);
      
      spyOn(beforeInitializeListener, 'notify');
      spyOn(afterInitializeListener, 'notify');
      spyOn(beforeExecuteListener, 'notify');
      spyOn(afterExecuteListener, 'notify');
      
      cdService.dispatch('someCommand');
      
      expect(beforeInitializeListener.notify).toHaveBeenCalledWith(command, 'beforeInitialize', 'someCommand');
      expect(afterInitializeListener.notify).toHaveBeenCalledWith(command, 'afterInitialize', 'someCommand');
      expect(beforeExecuteListener.notify).toHaveBeenCalledWith(command, 'beforeExecute', 'someCommand');
      expect(afterExecuteListener.notify).toHaveBeenCalledWith(command, 'afterExecute', 'someCommand');
    });
  });
});