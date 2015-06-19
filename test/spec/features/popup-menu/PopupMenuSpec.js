'use strict';

/* global bootstrapModeler, inject */

var TestHelper = require('../../../TestHelper'),
    coreModule = require('../../../../lib/core'),
    popupMenuModule = require('diagram-js/lib/features/popup-menu'),
    modelingModule = require('../../../../lib/features/modeling'),
    replaceModule = require('../../../../lib/features/replace'),
    domQuery = require('min-dom/lib/query'),
    domClasses = require('min-dom/lib/classes'),
    is = require('../../../../lib/util/ModelUtil').is;

function queryEntry(popupMenu, id) {
  return queryPopup(popupMenu, '[data-id="' + id + '"]');
}

function queryPopup(popupMenu, selector) {
  return domQuery(selector, popupMenu._current.container);
}

describe('features/popup-menu', function() {

  var diagramXML = require('../../../fixtures/bpmn/draw/activity-markers-simple.bpmn');

  var testModules = [ coreModule, modelingModule, popupMenuModule, replaceModule ];

  beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));

  describe('active attribute', function(){

    it('should be true for parallel marker', inject(function(popupMenu, bpmnReplace, elementRegistry) {

      // given
      var task = elementRegistry.get('ParallelTask'),
          loopCharacteristics = task.businessObject.loopCharacteristics;

      // when
      bpmnReplace.openChooser({ x: task.x + 100, y: task.y + 100 }, task);
    	
      // then
      expect(is(loopCharacteristics, 'bpmn:MultiInstanceLoopCharacteristics')).toBe(true);
      expect(loopCharacteristics.isSequential).not.toBe(undefined);
      expect(loopCharacteristics.isSequential).toBe(false);
      expect(popupMenu._getEntry('toggle-parallel-mi').active).toBe(true);
    }));


    it('should be true for sequential marker', inject(function(popupMenu, bpmnReplace, elementRegistry) {

      // given
      var task = elementRegistry.get('SequentialTask'),
          loopCharacteristics = task.businessObject.loopCharacteristics;

      // when
      bpmnReplace.openChooser({ x: task.x + 100, y: task.y + 100 }, task);
      
      // then
      expect(is(loopCharacteristics, 'bpmn:MultiInstanceLoopCharacteristics')).toBe(true);
      expect(loopCharacteristics.isSequential).toBe(true);   
      expect(popupMenu._getEntry('toggle-sequential-mi').active).toBe(true);
    }));


    it('should be true for loop marker', inject(function(popupMenu, bpmnReplace, elementRegistry) {

      // given
      var task = elementRegistry.get('LoopTask'),
          loopCharacteristics = task.businessObject.loopCharacteristics;

      // when
      bpmnReplace.openChooser({ x: task.x + 100, y: task.y + 100 }, task);
      
      // then
      expect(is(loopCharacteristics, 'bpmn:MultiInstanceLoopCharacteristics')).toBe(false);
      expect(loopCharacteristics.isSequential).toBe(undefined);   
      expect(popupMenu._getEntry('toggle-loop').active).toBe(true);
    }));
  });

  describe('parallel toggle button', function(){

    it('should toggle parallel task off', inject(function(popupMenu, bpmnReplace, elementRegistry){
      
      // given
      var task = elementRegistry.get('ParallelTask');

      bpmnReplace.openChooser({ x: task.x + 100, y: task.y + 100 }, task);

      var entry = queryEntry(popupMenu, 'toggle-parallel-mi'),
          evt = { target: entry, preventDefault: function(){} };

      // when
      popupMenu.trigger(evt);
      var parallelEntry = queryEntry(popupMenu, 'toggle-parallel-mi');

      // then
      expect(task.businessObject.loopCharacteristics).toBe(undefined);
      expect(domClasses(parallelEntry).has('active')).toBe(false);
    }));


    it('should toggle other buttons off', inject(function(popupMenu, bpmnReplace, elementRegistry){

      // given
      var task = elementRegistry.get('LoopTask');
      bpmnReplace.openChooser({ x: task.x + 100, y: task.y + 100 }, task);
          
      var entry = queryEntry(popupMenu, 'toggle-parallel-mi'),
          evt = { target: entry, preventDefault: function(){} };

      // when
      popupMenu.trigger(evt);
      var parallelEntry = queryEntry(popupMenu, 'toggle-parallel-mi'),
          loopEntry = queryEntry(popupMenu, 'toggle-loop');

      // then
      expect(task.businessObject.loopCharacteristics.isSequential).toBe(false);
      expect(domClasses(parallelEntry).has('active')).toBe(true);
      expect(domClasses(loopEntry).has('active')).toBe(false);
    }));
  });
});
