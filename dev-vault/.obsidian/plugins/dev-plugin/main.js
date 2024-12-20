"use strict";
var __defProp = Object.defineProperty;
var __typeError = (msg) => {
  throw TypeError(msg);
};
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var _count;
const obsidian = require("obsidian");
const PUBLIC_VERSION = "5";
if (typeof window !== "undefined")
  (window.__svelte || (window.__svelte = { v: /* @__PURE__ */ new Set() })).v.add(PUBLIC_VERSION);
const TEMPLATE_USE_IMPORT_NODE = 1 << 1;
const UNINITIALIZED = Symbol();
const PASSIVE_EVENTS = ["touchstart", "touchmove"];
function is_passive_event(name) {
  return PASSIVE_EVENTS.includes(name);
}
const DEV = false;
var is_array = Array.isArray;
var array_from = Array.from;
var define_property = Object.defineProperty;
var get_descriptor = Object.getOwnPropertyDescriptor;
var object_prototype = Object.prototype;
var array_prototype = Array.prototype;
var get_prototype_of = Object.getPrototypeOf;
const DERIVED = 1 << 1;
const EFFECT = 1 << 2;
const RENDER_EFFECT = 1 << 3;
const BLOCK_EFFECT = 1 << 4;
const BRANCH_EFFECT = 1 << 5;
const ROOT_EFFECT = 1 << 6;
const BOUNDARY_EFFECT = 1 << 7;
const UNOWNED = 1 << 8;
const DISCONNECTED = 1 << 9;
const CLEAN = 1 << 10;
const DIRTY = 1 << 11;
const MAYBE_DIRTY = 1 << 12;
const INERT = 1 << 13;
const DESTROYED = 1 << 14;
const EFFECT_RAN = 1 << 15;
const EFFECT_TRANSPARENT = 1 << 16;
const HEAD_EFFECT = 1 << 19;
const EFFECT_HAS_DERIVED = 1 << 20;
const STATE_SYMBOL = Symbol("$state");
function equals(value) {
  return value === this.v;
}
function effect_update_depth_exceeded() {
  {
    throw new Error(`https://svelte.dev/e/effect_update_depth_exceeded`);
  }
}
function state_descriptors_fixed() {
  {
    throw new Error(`https://svelte.dev/e/state_descriptors_fixed`);
  }
}
function state_prototype_fixed() {
  {
    throw new Error(`https://svelte.dev/e/state_prototype_fixed`);
  }
}
function state_unsafe_local_read() {
  {
    throw new Error(`https://svelte.dev/e/state_unsafe_local_read`);
  }
}
function state_unsafe_mutation() {
  {
    throw new Error(`https://svelte.dev/e/state_unsafe_mutation`);
  }
}
let legacy_mode_flag = false;
function source(v, stack) {
  var signal = {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    v,
    reactions: null,
    equals,
    version: 0
  };
  return signal;
}
function state(v) {
  return /* @__PURE__ */ push_derived_source(source(v));
}
// @__NO_SIDE_EFFECTS__
function push_derived_source(source2) {
  if (active_reaction !== null && (active_reaction.f & DERIVED) !== 0) {
    if (derived_sources === null) {
      set_derived_sources([source2]);
    } else {
      derived_sources.push(source2);
    }
  }
  return source2;
}
function set(source2, value) {
  if (active_reaction !== null && is_runes() && (active_reaction.f & (DERIVED | BLOCK_EFFECT)) !== 0 && // If the source was created locally within the current derived, then
  // we allow the mutation.
  (derived_sources === null || !derived_sources.includes(source2))) {
    state_unsafe_mutation();
  }
  return internal_set(source2, value);
}
function internal_set(source2, value) {
  if (!source2.equals(value)) {
    source2.v = value;
    source2.version = increment_version();
    mark_reactions(source2, DIRTY);
    if (active_effect !== null && (active_effect.f & CLEAN) !== 0 && (active_effect.f & BRANCH_EFFECT) === 0) {
      if (new_deps !== null && new_deps.includes(source2)) {
        set_signal_status(active_effect, DIRTY);
        schedule_effect(active_effect);
      } else {
        if (untracked_writes === null) {
          set_untracked_writes([source2]);
        } else {
          untracked_writes.push(source2);
        }
      }
    }
  }
  return value;
}
function mark_reactions(signal, status) {
  var reactions = signal.reactions;
  if (reactions === null) return;
  var length = reactions.length;
  for (var i = 0; i < length; i++) {
    var reaction = reactions[i];
    var flags = reaction.f;
    if ((flags & DIRTY) !== 0) continue;
    set_signal_status(reaction, status);
    if ((flags & (CLEAN | UNOWNED)) !== 0) {
      if ((flags & DERIVED) !== 0) {
        mark_reactions(
          /** @type {Derived} */
          reaction,
          MAYBE_DIRTY
        );
      } else {
        schedule_effect(
          /** @type {Effect} */
          reaction
        );
      }
    }
  }
}
function proxy(value, parent = null, prev) {
  if (typeof value !== "object" || value === null || STATE_SYMBOL in value) {
    return value;
  }
  const prototype = get_prototype_of(value);
  if (prototype !== object_prototype && prototype !== array_prototype) {
    return value;
  }
  var sources = /* @__PURE__ */ new Map();
  var is_proxied_array = is_array(value);
  var version = source(0);
  if (is_proxied_array) {
    sources.set("length", source(
      /** @type {any[]} */
      value.length
    ));
  }
  var metadata;
  return new Proxy(
    /** @type {any} */
    value,
    {
      defineProperty(_, prop, descriptor) {
        if (!("value" in descriptor) || descriptor.configurable === false || descriptor.enumerable === false || descriptor.writable === false) {
          state_descriptors_fixed();
        }
        var s = sources.get(prop);
        if (s === void 0) {
          s = source(descriptor.value);
          sources.set(prop, s);
        } else {
          set(s, proxy(descriptor.value, metadata));
        }
        return true;
      },
      deleteProperty(target, prop) {
        var s = sources.get(prop);
        if (s === void 0) {
          if (prop in target) {
            sources.set(prop, source(UNINITIALIZED));
          }
        } else {
          if (is_proxied_array && typeof prop === "string") {
            var ls = (
              /** @type {Source<number>} */
              sources.get("length")
            );
            var n = Number(prop);
            if (Number.isInteger(n) && n < ls.v) {
              set(ls, n);
            }
          }
          set(s, UNINITIALIZED);
          update_version(version);
        }
        return true;
      },
      get(target, prop, receiver) {
        var _a;
        if (prop === STATE_SYMBOL) {
          return value;
        }
        var s = sources.get(prop);
        var exists = prop in target;
        if (s === void 0 && (!exists || ((_a = get_descriptor(target, prop)) == null ? void 0 : _a.writable))) {
          s = source(proxy(exists ? target[prop] : UNINITIALIZED, metadata));
          sources.set(prop, s);
        }
        if (s !== void 0) {
          var v = get(s);
          return v === UNINITIALIZED ? void 0 : v;
        }
        return Reflect.get(target, prop, receiver);
      },
      getOwnPropertyDescriptor(target, prop) {
        var descriptor = Reflect.getOwnPropertyDescriptor(target, prop);
        if (descriptor && "value" in descriptor) {
          var s = sources.get(prop);
          if (s) descriptor.value = get(s);
        } else if (descriptor === void 0) {
          var source2 = sources.get(prop);
          var value2 = source2 == null ? void 0 : source2.v;
          if (source2 !== void 0 && value2 !== UNINITIALIZED) {
            return {
              enumerable: true,
              configurable: true,
              value: value2,
              writable: true
            };
          }
        }
        return descriptor;
      },
      has(target, prop) {
        var _a;
        if (prop === STATE_SYMBOL) {
          return true;
        }
        var s = sources.get(prop);
        var has = s !== void 0 && s.v !== UNINITIALIZED || Reflect.has(target, prop);
        if (s !== void 0 || active_effect !== null && (!has || ((_a = get_descriptor(target, prop)) == null ? void 0 : _a.writable))) {
          if (s === void 0) {
            s = source(has ? proxy(target[prop], metadata) : UNINITIALIZED);
            sources.set(prop, s);
          }
          var value2 = get(s);
          if (value2 === UNINITIALIZED) {
            return false;
          }
        }
        return has;
      },
      set(target, prop, value2, receiver) {
        var _a;
        var s = sources.get(prop);
        var has = prop in target;
        if (is_proxied_array && prop === "length") {
          for (var i = value2; i < /** @type {Source<number>} */
          s.v; i += 1) {
            var other_s = sources.get(i + "");
            if (other_s !== void 0) {
              set(other_s, UNINITIALIZED);
            } else if (i in target) {
              other_s = source(UNINITIALIZED);
              sources.set(i + "", other_s);
            }
          }
        }
        if (s === void 0) {
          if (!has || ((_a = get_descriptor(target, prop)) == null ? void 0 : _a.writable)) {
            s = source(void 0);
            set(s, proxy(value2, metadata));
            sources.set(prop, s);
          }
        } else {
          has = s.v !== UNINITIALIZED;
          set(s, proxy(value2, metadata));
        }
        var descriptor = Reflect.getOwnPropertyDescriptor(target, prop);
        if (descriptor == null ? void 0 : descriptor.set) {
          descriptor.set.call(receiver, value2);
        }
        if (!has) {
          if (is_proxied_array && typeof prop === "string") {
            var ls = (
              /** @type {Source<number>} */
              sources.get("length")
            );
            var n = Number(prop);
            if (Number.isInteger(n) && n >= ls.v) {
              set(ls, n + 1);
            }
          }
          update_version(version);
        }
        return true;
      },
      ownKeys(target) {
        get(version);
        var own_keys = Reflect.ownKeys(target).filter((key2) => {
          var source3 = sources.get(key2);
          return source3 === void 0 || source3.v !== UNINITIALIZED;
        });
        for (var [key, source2] of sources) {
          if (source2.v !== UNINITIALIZED && !(key in target)) {
            own_keys.push(key);
          }
        }
        return own_keys;
      },
      setPrototypeOf() {
        state_prototype_fixed();
      }
    }
  );
}
function update_version(signal, d = 1) {
  set(signal, signal.v + d);
}
var $window;
var first_child_getter;
var next_sibling_getter;
function init_operations() {
  if ($window !== void 0) {
    return;
  }
  $window = window;
  var element_prototype = Element.prototype;
  var node_prototype = Node.prototype;
  first_child_getter = get_descriptor(node_prototype, "firstChild").get;
  next_sibling_getter = get_descriptor(node_prototype, "nextSibling").get;
  element_prototype.__click = void 0;
  element_prototype.__className = "";
  element_prototype.__attributes = null;
  element_prototype.__styles = null;
  element_prototype.__e = void 0;
  Text.prototype.__t = void 0;
}
function create_text(value = "") {
  return document.createTextNode(value);
}
// @__NO_SIDE_EFFECTS__
function get_first_child(node) {
  return first_child_getter.call(node);
}
// @__NO_SIDE_EFFECTS__
function get_next_sibling(node) {
  return next_sibling_getter.call(node);
}
function child(node, is_text) {
  {
    return /* @__PURE__ */ get_first_child(node);
  }
}
function sibling(node, count = 1, is_text = false) {
  let next_sibling = node;
  while (count--) {
    next_sibling = /** @type {TemplateNode} */
    /* @__PURE__ */ get_next_sibling(next_sibling);
  }
  {
    return next_sibling;
  }
}
function destroy_derived_children(derived) {
  var children = derived.children;
  if (children !== null) {
    derived.children = null;
    for (var i = 0; i < children.length; i += 1) {
      var child2 = children[i];
      if ((child2.f & DERIVED) !== 0) {
        destroy_derived(
          /** @type {Derived} */
          child2
        );
      } else {
        destroy_effect(
          /** @type {Effect} */
          child2
        );
      }
    }
  }
}
function get_derived_parent_effect(derived) {
  var parent = derived.parent;
  while (parent !== null) {
    if ((parent.f & DERIVED) === 0) {
      return (
        /** @type {Effect} */
        parent
      );
    }
    parent = parent.parent;
  }
  return null;
}
function execute_derived(derived) {
  var value;
  var prev_active_effect = active_effect;
  set_active_effect(get_derived_parent_effect(derived));
  {
    try {
      destroy_derived_children(derived);
      value = update_reaction(derived);
    } finally {
      set_active_effect(prev_active_effect);
    }
  }
  return value;
}
function update_derived(derived) {
  var value = execute_derived(derived);
  var status = (skip_reaction || (derived.f & UNOWNED) !== 0) && derived.deps !== null ? MAYBE_DIRTY : CLEAN;
  set_signal_status(derived, status);
  if (!derived.equals(value)) {
    derived.v = value;
    derived.version = increment_version();
  }
}
function destroy_derived(derived) {
  destroy_derived_children(derived);
  remove_reactions(derived, 0);
  set_signal_status(derived, DESTROYED);
  derived.v = derived.children = derived.deps = derived.ctx = derived.reactions = null;
}
function push_effect(effect2, parent_effect) {
  var parent_last = parent_effect.last;
  if (parent_last === null) {
    parent_effect.last = parent_effect.first = effect2;
  } else {
    parent_last.next = effect2;
    effect2.prev = parent_last;
    parent_effect.last = effect2;
  }
}
function create_effect(type, fn, sync, push2 = true) {
  var is_root = (type & ROOT_EFFECT) !== 0;
  var parent_effect = active_effect;
  var effect2 = {
    ctx: component_context,
    deps: null,
    deriveds: null,
    nodes_start: null,
    nodes_end: null,
    f: type | DIRTY,
    first: null,
    fn,
    last: null,
    next: null,
    parent: is_root ? null : parent_effect,
    prev: null,
    teardown: null,
    transitions: null,
    version: 0
  };
  if (sync) {
    var previously_flushing_effect = is_flushing_effect;
    try {
      set_is_flushing_effect(true);
      update_effect(effect2);
      effect2.f |= EFFECT_RAN;
    } catch (e) {
      destroy_effect(effect2);
      throw e;
    } finally {
      set_is_flushing_effect(previously_flushing_effect);
    }
  } else if (fn !== null) {
    schedule_effect(effect2);
  }
  var inert = sync && effect2.deps === null && effect2.first === null && effect2.nodes_start === null && effect2.teardown === null && (effect2.f & EFFECT_HAS_DERIVED) === 0;
  if (!inert && !is_root && push2) {
    if (parent_effect !== null) {
      push_effect(effect2, parent_effect);
    }
    if (active_reaction !== null && (active_reaction.f & DERIVED) !== 0) {
      var derived = (
        /** @type {Derived} */
        active_reaction
      );
      (derived.children ?? (derived.children = [])).push(effect2);
    }
  }
  return effect2;
}
function component_root(fn) {
  const effect2 = create_effect(ROOT_EFFECT, fn, true);
  return (options = {}) => {
    return new Promise((fulfil) => {
      if (options.outro) {
        pause_effect(effect2, () => {
          destroy_effect(effect2);
          fulfil(void 0);
        });
      } else {
        destroy_effect(effect2);
        fulfil(void 0);
      }
    });
  };
}
function effect(fn) {
  return create_effect(EFFECT, fn, false);
}
function template_effect(fn) {
  return block(fn);
}
function block(fn, flags = 0) {
  return create_effect(RENDER_EFFECT | BLOCK_EFFECT | flags, fn, true);
}
function branch(fn, push2 = true) {
  return create_effect(RENDER_EFFECT | BRANCH_EFFECT, fn, true, push2);
}
function execute_effect_teardown(effect2) {
  var teardown = effect2.teardown;
  if (teardown !== null) {
    const previous_reaction = active_reaction;
    set_active_reaction(null);
    try {
      teardown.call(null);
    } finally {
      set_active_reaction(previous_reaction);
    }
  }
}
function destroy_effect_deriveds(signal) {
  var deriveds = signal.deriveds;
  if (deriveds !== null) {
    signal.deriveds = null;
    for (var i = 0; i < deriveds.length; i += 1) {
      destroy_derived(deriveds[i]);
    }
  }
}
function destroy_effect_children(signal, remove_dom = false) {
  var effect2 = signal.first;
  signal.first = signal.last = null;
  while (effect2 !== null) {
    var next = effect2.next;
    destroy_effect(effect2, remove_dom);
    effect2 = next;
  }
}
function destroy_block_effect_children(signal) {
  var effect2 = signal.first;
  while (effect2 !== null) {
    var next = effect2.next;
    if ((effect2.f & BRANCH_EFFECT) === 0) {
      destroy_effect(effect2);
    }
    effect2 = next;
  }
}
function destroy_effect(effect2, remove_dom = true) {
  var removed = false;
  if ((remove_dom || (effect2.f & HEAD_EFFECT) !== 0) && effect2.nodes_start !== null) {
    var node = effect2.nodes_start;
    var end = effect2.nodes_end;
    while (node !== null) {
      var next = node === end ? null : (
        /** @type {TemplateNode} */
        /* @__PURE__ */ get_next_sibling(node)
      );
      node.remove();
      node = next;
    }
    removed = true;
  }
  destroy_effect_children(effect2, remove_dom && !removed);
  destroy_effect_deriveds(effect2);
  remove_reactions(effect2, 0);
  set_signal_status(effect2, DESTROYED);
  var transitions = effect2.transitions;
  if (transitions !== null) {
    for (const transition of transitions) {
      transition.stop();
    }
  }
  execute_effect_teardown(effect2);
  var parent = effect2.parent;
  if (parent !== null && parent.first !== null) {
    unlink_effect(effect2);
  }
  effect2.next = effect2.prev = effect2.teardown = effect2.ctx = effect2.deps = effect2.fn = effect2.nodes_start = effect2.nodes_end = null;
}
function unlink_effect(effect2) {
  var parent = effect2.parent;
  var prev = effect2.prev;
  var next = effect2.next;
  if (prev !== null) prev.next = next;
  if (next !== null) next.prev = prev;
  if (parent !== null) {
    if (parent.first === effect2) parent.first = next;
    if (parent.last === effect2) parent.last = prev;
  }
}
function pause_effect(effect2, callback) {
  var transitions = [];
  pause_children(effect2, transitions, true);
  run_out_transitions(transitions, () => {
    destroy_effect(effect2);
    if (callback) callback();
  });
}
function run_out_transitions(transitions, fn) {
  var remaining = transitions.length;
  if (remaining > 0) {
    var check = () => --remaining || fn();
    for (var transition of transitions) {
      transition.out(check);
    }
  } else {
    fn();
  }
}
function pause_children(effect2, transitions, local) {
  if ((effect2.f & INERT) !== 0) return;
  effect2.f ^= INERT;
  if (effect2.transitions !== null) {
    for (const transition of effect2.transitions) {
      if (transition.is_global || local) {
        transitions.push(transition);
      }
    }
  }
  var child2 = effect2.first;
  while (child2 !== null) {
    var sibling2 = child2.next;
    var transparent = (child2.f & EFFECT_TRANSPARENT) !== 0 || (child2.f & BRANCH_EFFECT) !== 0;
    pause_children(child2, transitions, transparent ? local : false);
    child2 = sibling2;
  }
}
let is_throwing_error = false;
let is_micro_task_queued = false;
let last_scheduled_effect = null;
let is_flushing_effect = false;
function set_is_flushing_effect(value) {
  is_flushing_effect = value;
}
let queued_root_effects = [];
let flush_count = 0;
let dev_effect_stack = [];
let active_reaction = null;
function set_active_reaction(reaction) {
  active_reaction = reaction;
}
let active_effect = null;
function set_active_effect(effect2) {
  active_effect = effect2;
}
let derived_sources = null;
function set_derived_sources(sources) {
  derived_sources = sources;
}
let new_deps = null;
let skipped_deps = 0;
let untracked_writes = null;
function set_untracked_writes(value) {
  untracked_writes = value;
}
let current_version = 1;
let skip_reaction = false;
let component_context = null;
function increment_version() {
  return ++current_version;
}
function is_runes() {
  return !legacy_mode_flag;
}
function check_dirtiness(reaction) {
  var _a, _b;
  var flags = reaction.f;
  if ((flags & DIRTY) !== 0) {
    return true;
  }
  if ((flags & MAYBE_DIRTY) !== 0) {
    var dependencies = reaction.deps;
    var is_unowned = (flags & UNOWNED) !== 0;
    if (dependencies !== null) {
      var i;
      if ((flags & DISCONNECTED) !== 0) {
        for (i = 0; i < dependencies.length; i++) {
          ((_a = dependencies[i]).reactions ?? (_a.reactions = [])).push(reaction);
        }
        reaction.f ^= DISCONNECTED;
      }
      for (i = 0; i < dependencies.length; i++) {
        var dependency = dependencies[i];
        if (check_dirtiness(
          /** @type {Derived} */
          dependency
        )) {
          update_derived(
            /** @type {Derived} */
            dependency
          );
        }
        if (is_unowned && active_effect !== null && !skip_reaction && !((_b = dependency == null ? void 0 : dependency.reactions) == null ? void 0 : _b.includes(reaction))) {
          (dependency.reactions ?? (dependency.reactions = [])).push(reaction);
        }
        if (dependency.version > reaction.version) {
          return true;
        }
      }
    }
    if (!is_unowned || active_effect !== null && !skip_reaction) {
      set_signal_status(reaction, CLEAN);
    }
  }
  return false;
}
function propagate_error(error, effect2) {
  var current = effect2;
  while (current !== null) {
    if ((current.f & BOUNDARY_EFFECT) !== 0) {
      try {
        current.fn(error);
        return;
      } catch {
        current.f ^= BOUNDARY_EFFECT;
      }
    }
    current = current.parent;
  }
  is_throwing_error = false;
  throw error;
}
function should_rethrow_error(effect2) {
  return (effect2.f & DESTROYED) === 0 && (effect2.parent === null || (effect2.parent.f & BOUNDARY_EFFECT) === 0);
}
function handle_error(error, effect2, previous_effect, component_context2) {
  if (is_throwing_error) {
    if (previous_effect === null) {
      is_throwing_error = false;
    }
    if (should_rethrow_error(effect2)) {
      throw error;
    }
    return;
  }
  if (previous_effect !== null) {
    is_throwing_error = true;
  }
  {
    propagate_error(error, effect2);
    return;
  }
}
function update_reaction(reaction) {
  var _a;
  var previous_deps = new_deps;
  var previous_skipped_deps = skipped_deps;
  var previous_untracked_writes = untracked_writes;
  var previous_reaction = active_reaction;
  var previous_skip_reaction = skip_reaction;
  var prev_derived_sources = derived_sources;
  var previous_component_context = component_context;
  var flags = reaction.f;
  new_deps = /** @type {null | Value[]} */
  null;
  skipped_deps = 0;
  untracked_writes = null;
  active_reaction = (flags & (BRANCH_EFFECT | ROOT_EFFECT)) === 0 ? reaction : null;
  skip_reaction = !is_flushing_effect && (flags & UNOWNED) !== 0;
  derived_sources = null;
  component_context = reaction.ctx;
  try {
    var result = (
      /** @type {Function} */
      (0, reaction.fn)()
    );
    var deps = reaction.deps;
    if (new_deps !== null) {
      var i;
      remove_reactions(reaction, skipped_deps);
      if (deps !== null && skipped_deps > 0) {
        deps.length = skipped_deps + new_deps.length;
        for (i = 0; i < new_deps.length; i++) {
          deps[skipped_deps + i] = new_deps[i];
        }
      } else {
        reaction.deps = deps = new_deps;
      }
      if (!skip_reaction) {
        for (i = skipped_deps; i < deps.length; i++) {
          ((_a = deps[i]).reactions ?? (_a.reactions = [])).push(reaction);
        }
      }
    } else if (deps !== null && skipped_deps < deps.length) {
      remove_reactions(reaction, skipped_deps);
      deps.length = skipped_deps;
    }
    return result;
  } finally {
    new_deps = previous_deps;
    skipped_deps = previous_skipped_deps;
    untracked_writes = previous_untracked_writes;
    active_reaction = previous_reaction;
    skip_reaction = previous_skip_reaction;
    derived_sources = prev_derived_sources;
    component_context = previous_component_context;
  }
}
function remove_reaction(signal, dependency) {
  let reactions = dependency.reactions;
  if (reactions !== null) {
    var index = reactions.indexOf(signal);
    if (index !== -1) {
      var new_length = reactions.length - 1;
      if (new_length === 0) {
        reactions = dependency.reactions = null;
      } else {
        reactions[index] = reactions[new_length];
        reactions.pop();
      }
    }
  }
  if (reactions === null && (dependency.f & DERIVED) !== 0 && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (new_deps === null || !new_deps.includes(dependency))) {
    set_signal_status(dependency, MAYBE_DIRTY);
    if ((dependency.f & (UNOWNED | DISCONNECTED)) === 0) {
      dependency.f ^= DISCONNECTED;
    }
    remove_reactions(
      /** @type {Derived} **/
      dependency,
      0
    );
  }
}
function remove_reactions(signal, start_index) {
  var dependencies = signal.deps;
  if (dependencies === null) return;
  for (var i = start_index; i < dependencies.length; i++) {
    remove_reaction(signal, dependencies[i]);
  }
}
function update_effect(effect2) {
  var flags = effect2.f;
  if ((flags & DESTROYED) !== 0) {
    return;
  }
  set_signal_status(effect2, CLEAN);
  var previous_effect = active_effect;
  var previous_component_context = component_context;
  active_effect = effect2;
  try {
    if ((flags & BLOCK_EFFECT) !== 0) {
      destroy_block_effect_children(effect2);
    } else {
      destroy_effect_children(effect2);
    }
    destroy_effect_deriveds(effect2);
    execute_effect_teardown(effect2);
    var teardown = update_reaction(effect2);
    effect2.teardown = typeof teardown === "function" ? teardown : null;
    effect2.version = current_version;
    if (DEV) ;
  } catch (error) {
    handle_error(error, effect2, previous_effect, previous_component_context || effect2.ctx);
  } finally {
    active_effect = previous_effect;
  }
}
function infinite_loop_guard() {
  if (flush_count > 1e3) {
    flush_count = 0;
    try {
      effect_update_depth_exceeded();
    } catch (error) {
      if (last_scheduled_effect !== null) {
        {
          handle_error(error, last_scheduled_effect, null);
        }
      } else {
        throw error;
      }
    }
  }
  flush_count++;
}
function flush_queued_root_effects(root_effects) {
  var length = root_effects.length;
  if (length === 0) {
    return;
  }
  infinite_loop_guard();
  var previously_flushing_effect = is_flushing_effect;
  is_flushing_effect = true;
  try {
    for (var i = 0; i < length; i++) {
      var effect2 = root_effects[i];
      if ((effect2.f & CLEAN) === 0) {
        effect2.f ^= CLEAN;
      }
      var collected_effects = [];
      process_effects(effect2, collected_effects);
      flush_queued_effects(collected_effects);
    }
  } finally {
    is_flushing_effect = previously_flushing_effect;
  }
}
function flush_queued_effects(effects) {
  var length = effects.length;
  if (length === 0) return;
  for (var i = 0; i < length; i++) {
    var effect2 = effects[i];
    if ((effect2.f & (DESTROYED | INERT)) === 0) {
      try {
        if (check_dirtiness(effect2)) {
          update_effect(effect2);
          if (effect2.deps === null && effect2.first === null && effect2.nodes_start === null) {
            if (effect2.teardown === null) {
              unlink_effect(effect2);
            } else {
              effect2.fn = null;
            }
          }
        }
      } catch (error) {
        handle_error(error, effect2, null, effect2.ctx);
      }
    }
  }
}
function process_deferred() {
  is_micro_task_queued = false;
  if (flush_count > 1001) {
    return;
  }
  const previous_queued_root_effects = queued_root_effects;
  queued_root_effects = [];
  flush_queued_root_effects(previous_queued_root_effects);
  if (!is_micro_task_queued) {
    flush_count = 0;
    last_scheduled_effect = null;
  }
}
function schedule_effect(signal) {
  {
    if (!is_micro_task_queued) {
      is_micro_task_queued = true;
      queueMicrotask(process_deferred);
    }
  }
  last_scheduled_effect = signal;
  var effect2 = signal;
  while (effect2.parent !== null) {
    effect2 = effect2.parent;
    var flags = effect2.f;
    if ((flags & (ROOT_EFFECT | BRANCH_EFFECT)) !== 0) {
      if ((flags & CLEAN) === 0) return;
      effect2.f ^= CLEAN;
    }
  }
  queued_root_effects.push(effect2);
}
function process_effects(effect2, collected_effects) {
  var current_effect = effect2.first;
  var effects = [];
  main_loop: while (current_effect !== null) {
    var flags = current_effect.f;
    var is_branch = (flags & BRANCH_EFFECT) !== 0;
    var is_skippable_branch = is_branch && (flags & CLEAN) !== 0;
    var sibling2 = current_effect.next;
    if (!is_skippable_branch && (flags & INERT) === 0) {
      if ((flags & RENDER_EFFECT) !== 0) {
        if (is_branch) {
          current_effect.f ^= CLEAN;
        } else {
          try {
            if (check_dirtiness(current_effect)) {
              update_effect(current_effect);
            }
          } catch (error) {
            handle_error(error, current_effect, null, current_effect.ctx);
          }
        }
        var child2 = current_effect.first;
        if (child2 !== null) {
          current_effect = child2;
          continue;
        }
      } else if ((flags & EFFECT) !== 0) {
        effects.push(current_effect);
      }
    }
    if (sibling2 === null) {
      let parent = current_effect.parent;
      while (parent !== null) {
        if (effect2 === parent) {
          break main_loop;
        }
        var parent_sibling = parent.next;
        if (parent_sibling !== null) {
          current_effect = parent_sibling;
          continue main_loop;
        }
        parent = parent.parent;
      }
    }
    current_effect = sibling2;
  }
  for (var i = 0; i < effects.length; i++) {
    child2 = effects[i];
    collected_effects.push(child2);
    process_effects(child2, collected_effects);
  }
}
function get(signal) {
  var _a;
  var flags = signal.f;
  var is_derived = (flags & DERIVED) !== 0;
  if (is_derived && (flags & DESTROYED) !== 0) {
    var value = execute_derived(
      /** @type {Derived} */
      signal
    );
    destroy_derived(
      /** @type {Derived} */
      signal
    );
    return value;
  }
  if (active_reaction !== null) {
    if (derived_sources !== null && derived_sources.includes(signal)) {
      state_unsafe_local_read();
    }
    var deps = active_reaction.deps;
    if (new_deps === null && deps !== null && deps[skipped_deps] === signal) {
      skipped_deps++;
    } else if (new_deps === null) {
      new_deps = [signal];
    } else {
      new_deps.push(signal);
    }
    if (untracked_writes !== null && active_effect !== null && (active_effect.f & CLEAN) !== 0 && (active_effect.f & BRANCH_EFFECT) === 0 && untracked_writes.includes(signal)) {
      set_signal_status(active_effect, DIRTY);
      schedule_effect(active_effect);
    }
  } else if (is_derived && /** @type {Derived} */
  signal.deps === null) {
    var derived = (
      /** @type {Derived} */
      signal
    );
    var parent = derived.parent;
    var target = derived;
    while (parent !== null) {
      if ((parent.f & DERIVED) !== 0) {
        var parent_derived = (
          /** @type {Derived} */
          parent
        );
        target = parent_derived;
        parent = parent_derived.parent;
      } else {
        var parent_effect = (
          /** @type {Effect} */
          parent
        );
        if (!((_a = parent_effect.deriveds) == null ? void 0 : _a.includes(target))) {
          (parent_effect.deriveds ?? (parent_effect.deriveds = [])).push(target);
        }
        break;
      }
    }
  }
  if (is_derived) {
    derived = /** @type {Derived} */
    signal;
    if (check_dirtiness(derived)) {
      update_derived(derived);
    }
  }
  return signal.v;
}
const STATUS_MASK = ~(DIRTY | MAYBE_DIRTY | CLEAN);
function set_signal_status(signal, status) {
  signal.f = signal.f & STATUS_MASK | status;
}
function update(signal, d = 1) {
  var value = get(signal);
  var result = d === 1 ? value++ : value--;
  set(signal, value);
  return result;
}
function push(props, runes = false, fn) {
  component_context = {
    p: component_context,
    c: null,
    e: null,
    m: false,
    s: props,
    x: null,
    l: null
  };
}
function pop(component) {
  const context_stack_item = component_context;
  if (context_stack_item !== null) {
    const component_effects = context_stack_item.e;
    if (component_effects !== null) {
      var previous_effect = active_effect;
      var previous_reaction = active_reaction;
      context_stack_item.e = null;
      try {
        for (var i = 0; i < component_effects.length; i++) {
          var component_effect = component_effects[i];
          set_active_effect(component_effect.effect);
          set_active_reaction(component_effect.reaction);
          effect(component_effect.fn);
        }
      } finally {
        set_active_effect(previous_effect);
        set_active_reaction(previous_reaction);
      }
    }
    component_context = context_stack_item.p;
    context_stack_item.m = true;
  }
  return (
    /** @type {T} */
    {}
  );
}
const all_registered_events = /* @__PURE__ */ new Set();
const root_event_handles = /* @__PURE__ */ new Set();
function delegate(events) {
  for (var i = 0; i < events.length; i++) {
    all_registered_events.add(events[i]);
  }
  for (var fn of root_event_handles) {
    fn(events);
  }
}
function handle_event_propagation(event) {
  var _a;
  var handler_element = this;
  var owner_document = (
    /** @type {Node} */
    handler_element.ownerDocument
  );
  var event_name = event.type;
  var path = ((_a = event.composedPath) == null ? void 0 : _a.call(event)) || [];
  var current_target = (
    /** @type {null | Element} */
    path[0] || event.target
  );
  var path_idx = 0;
  var handled_at = event.__root;
  if (handled_at) {
    var at_idx = path.indexOf(handled_at);
    if (at_idx !== -1 && (handler_element === document || handler_element === /** @type {any} */
    window)) {
      event.__root = handler_element;
      return;
    }
    var handler_idx = path.indexOf(handler_element);
    if (handler_idx === -1) {
      return;
    }
    if (at_idx <= handler_idx) {
      path_idx = at_idx;
    }
  }
  current_target = /** @type {Element} */
  path[path_idx] || event.target;
  if (current_target === handler_element) return;
  define_property(event, "currentTarget", {
    configurable: true,
    get() {
      return current_target || owner_document;
    }
  });
  var previous_reaction = active_reaction;
  var previous_effect = active_effect;
  set_active_reaction(null);
  set_active_effect(null);
  try {
    var throw_error;
    var other_errors = [];
    while (current_target !== null) {
      var parent_element = current_target.assignedSlot || current_target.parentNode || /** @type {any} */
      current_target.host || null;
      try {
        var delegated = current_target["__" + event_name];
        if (delegated !== void 0 && !/** @type {any} */
        current_target.disabled) {
          if (is_array(delegated)) {
            var [fn, ...data] = delegated;
            fn.apply(current_target, [event, ...data]);
          } else {
            delegated.call(current_target, event);
          }
        }
      } catch (error) {
        if (throw_error) {
          other_errors.push(error);
        } else {
          throw_error = error;
        }
      }
      if (event.cancelBubble || parent_element === handler_element || parent_element === null) {
        break;
      }
      current_target = parent_element;
    }
    if (throw_error) {
      for (let error of other_errors) {
        queueMicrotask(() => {
          throw error;
        });
      }
      throw throw_error;
    }
  } finally {
    event.__root = handler_element;
    delete event.currentTarget;
    set_active_reaction(previous_reaction);
    set_active_effect(previous_effect);
  }
}
function create_fragment_from_html(html) {
  var elem = document.createElement("template");
  elem.innerHTML = html;
  return elem.content;
}
function assign_nodes(start, end) {
  var effect2 = (
    /** @type {Effect} */
    active_effect
  );
  if (effect2.nodes_start === null) {
    effect2.nodes_start = start;
    effect2.nodes_end = end;
  }
}
// @__NO_SIDE_EFFECTS__
function template(content, flags) {
  var use_import_node = (flags & TEMPLATE_USE_IMPORT_NODE) !== 0;
  var node;
  var has_start = !content.startsWith("<!>");
  return () => {
    if (node === void 0) {
      node = create_fragment_from_html(has_start ? content : "<!>" + content);
      node = /** @type {Node} */
      /* @__PURE__ */ get_first_child(node);
    }
    var clone = (
      /** @type {TemplateNode} */
      use_import_node ? document.importNode(node, true) : node.cloneNode(true)
    );
    {
      assign_nodes(clone, clone);
    }
    return clone;
  };
}
function append(anchor, dom) {
  if (anchor === null) {
    return;
  }
  anchor.before(
    /** @type {Node} */
    dom
  );
}
function set_text(text, value) {
  var str = value == null ? "" : typeof value === "object" ? value + "" : value;
  if (str !== (text.__t ?? (text.__t = text.nodeValue))) {
    text.__t = str;
    text.nodeValue = str == null ? "" : str + "";
  }
}
function mount(component, options) {
  return _mount(component, options);
}
const document_listeners = /* @__PURE__ */ new Map();
function _mount(Component, { target, anchor, props = {}, events, context, intro = true }) {
  init_operations();
  var registered_events = /* @__PURE__ */ new Set();
  var event_handle = (events2) => {
    for (var i = 0; i < events2.length; i++) {
      var event_name = events2[i];
      if (registered_events.has(event_name)) continue;
      registered_events.add(event_name);
      var passive = is_passive_event(event_name);
      target.addEventListener(event_name, handle_event_propagation, { passive });
      var n = document_listeners.get(event_name);
      if (n === void 0) {
        document.addEventListener(event_name, handle_event_propagation, { passive });
        document_listeners.set(event_name, 1);
      } else {
        document_listeners.set(event_name, n + 1);
      }
    }
  };
  event_handle(array_from(all_registered_events));
  root_event_handles.add(event_handle);
  var component = void 0;
  var unmount = component_root(() => {
    var anchor_node = anchor ?? target.appendChild(create_text());
    branch(() => {
      if (context) {
        push({});
        var ctx = (
          /** @type {ComponentContext} */
          component_context
        );
        ctx.c = context;
      }
      if (events) {
        props.$$events = events;
      }
      component = Component(anchor_node, props) || {};
      if (context) {
        pop();
      }
    });
    return () => {
      var _a;
      for (var event_name of registered_events) {
        target.removeEventListener(event_name, handle_event_propagation);
        var n = (
          /** @type {number} */
          document_listeners.get(event_name)
        );
        if (--n === 0) {
          document.removeEventListener(event_name, handle_event_propagation);
          document_listeners.delete(event_name);
        } else {
          document_listeners.set(event_name, n);
        }
      }
      root_event_handles.delete(event_handle);
      if (anchor_node !== anchor) {
        (_a = anchor_node.parentNode) == null ? void 0 : _a.removeChild(anchor_node);
      }
    };
  });
  mounted_components.set(component, unmount);
  return component;
}
let mounted_components = /* @__PURE__ */ new WeakMap();
class ExampleModel {
  constructor() {
    __privateAdd(this, _count, state(0));
    this.count = 0;
  }
  get count() {
    return get(__privateGet(this, _count));
  }
  set count(value) {
    set(__privateGet(this, _count), proxy(value));
  }
  increment() {
    this.count++;
  }
}
_count = new WeakMap();
var on_click = (_, count) => update(count);
var on_click_1 = (__1, model) => model.increment();
var root = /* @__PURE__ */ template(`<div><h1 class="text-2xl text-red-100"> </h1> <h2>Local State</h2> <button>+</button> <h2>Model State</h2> <button>+</button></div>`);
function ExampleComponent($$anchor, $$props) {
  push($$props, true);
  let count = state(0);
  let model = new ExampleModel();
  var div = root();
  var h1 = child(div);
  var text = child(h1);
  var text_1 = sibling(h1, 3);
  var button = sibling(text_1);
  button.__click = [on_click, count];
  var text_2 = sibling(button, 3);
  var button_1 = sibling(text_2);
  button_1.__click = [on_click_1, model];
  template_effect(() => {
    set_text(text, `Hello ${$$props.someProp ?? ""}!`);
    set_text(text_1, ` ${get(count) ?? ""} `);
    set_text(text_2, ` ${model.count ?? ""} `);
  });
  append($$anchor, div);
  pop();
}
delegate(["click"]);
class ExampleView extends obsidian.ItemView {
  constructor(leaf, identifier) {
    super(leaf);
    __publicField(this, "identifier");
    __publicField(this, "component");
    this.identifier = identifier;
  }
  getViewType() {
    return this.identifier;
  }
  getDisplayText() {
    return "Example View";
  }
  async onOpen() {
    this.component = mount(ExampleComponent, {
      target: this.contentEl,
      props: {
        someProp: "world"
      }
    });
  }
  async onClose() {
  }
}
class ExampleModule {
  constructor(plugin) {
    __publicField(this, "identifier", "example");
    __publicField(this, "plugin");
    this.plugin = plugin;
  }
  onload() {
    this.plugin.addRibbonIcon("dice", "Sample Plugin", (evt) => {
      this.activateLeaf();
    });
    this.plugin.registerView(
      this.identifier,
      (leaf) => new ExampleView(leaf, this.identifier)
    );
  }
  async activateLeaf() {
    const { workspace } = this.plugin.app;
    let leaf = null;
    const leaves = workspace.getLeavesOfType(this.identifier);
    if (leaves.length > 0) {
      leaf = leaves[0];
    } else {
      leaf = workspace.getRightLeaf(false);
      if (leaf === null) {
        throw new Error("No leaf found");
      }
      await leaf.setViewState({
        type: this.identifier
      });
    }
    workspace.revealLeaf(leaf);
  }
  onunload() {
  }
}
class MyPlugin extends obsidian.Plugin {
  constructor(app, manifest) {
    super(app, manifest);
    __publicField(this, "modules");
    this.modules = [
      new ExampleModule(this)
    ];
  }
  async onload() {
    this.modules.forEach((module2) => module2.onload());
  }
  onunload() {
    this.modules.forEach((module2) => module2.onunload());
  }
}
module.exports = MyPlugin;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3N2ZWx0ZS9zcmMvdmVyc2lvbi5qcyIsIi4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9zdmVsdGUvc3JjL2ludGVybmFsL2Rpc2Nsb3NlLXZlcnNpb24uanMiLCIuLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvc3ZlbHRlL3NyYy9jb25zdGFudHMuanMiLCIuLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvc3ZlbHRlL3NyYy91dGlscy5qcyIsIi4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9lc20tZW52L2ZhbHNlLmpzIiwiLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3N2ZWx0ZS9zcmMvaW50ZXJuYWwvc2hhcmVkL3V0aWxzLmpzIiwiLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3N2ZWx0ZS9zcmMvaW50ZXJuYWwvY2xpZW50L2NvbnN0YW50cy5qcyIsIi4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9zdmVsdGUvc3JjL2ludGVybmFsL2NsaWVudC9yZWFjdGl2aXR5L2VxdWFsaXR5LmpzIiwiLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3N2ZWx0ZS9zcmMvaW50ZXJuYWwvY2xpZW50L2Vycm9ycy5qcyIsIi4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9zdmVsdGUvc3JjL2ludGVybmFsL2ZsYWdzL2luZGV4LmpzIiwiLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3N2ZWx0ZS9zcmMvaW50ZXJuYWwvY2xpZW50L3JlYWN0aXZpdHkvc291cmNlcy5qcyIsIi4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9zdmVsdGUvc3JjL2ludGVybmFsL2NsaWVudC9wcm94eS5qcyIsIi4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9zdmVsdGUvc3JjL2ludGVybmFsL2NsaWVudC9kb20vb3BlcmF0aW9ucy5qcyIsIi4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9zdmVsdGUvc3JjL2ludGVybmFsL2NsaWVudC9yZWFjdGl2aXR5L2Rlcml2ZWRzLmpzIiwiLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3N2ZWx0ZS9zcmMvaW50ZXJuYWwvY2xpZW50L3JlYWN0aXZpdHkvZWZmZWN0cy5qcyIsIi4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9zdmVsdGUvc3JjL2ludGVybmFsL2NsaWVudC9ydW50aW1lLmpzIiwiLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3N2ZWx0ZS9zcmMvaW50ZXJuYWwvY2xpZW50L2RvbS9lbGVtZW50cy9ldmVudHMuanMiLCIuLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvc3ZlbHRlL3NyYy9pbnRlcm5hbC9jbGllbnQvZG9tL3JlY29uY2lsZXIuanMiLCIuLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvc3ZlbHRlL3NyYy9pbnRlcm5hbC9jbGllbnQvZG9tL3RlbXBsYXRlLmpzIiwiLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3N2ZWx0ZS9zcmMvaW50ZXJuYWwvY2xpZW50L3JlbmRlci5qcyIsIi4uLy4uLy4uLy4uL3NyYy9tb2R1bGVzL2V4YW1wbGUvRXhhbXBsZU1vZGVsLnN2ZWx0ZS50cyIsIi4uLy4uLy4uLy4uL3NyYy9tb2R1bGVzL2V4YW1wbGUvRXhhbXBsZUNvbXBvbmVudC5zdmVsdGUiLCIuLi8uLi8uLi8uLi9zcmMvbW9kdWxlcy9leGFtcGxlL0V4YW1wbGVWaWV3LnRzIiwiLi4vLi4vLi4vLi4vc3JjL21vZHVsZXMvZXhhbXBsZS9FeGFtcGxlTW9kdWxlLnRzIiwiLi4vLi4vLi4vLi4vc3JjL21haW4udHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gZ2VuZXJhdGVkIGR1cmluZyByZWxlYXNlLCBkbyBub3QgbW9kaWZ5XG5cbi8qKlxuICogVGhlIGN1cnJlbnQgdmVyc2lvbiwgYXMgc2V0IGluIHBhY2thZ2UuanNvbi5cbiAqXG4gKiBodHRwczovL3N2ZWx0ZS5kZXYvZG9jcy9zdmVsdGUtY29tcGlsZXIjc3ZlbHRlLXZlcnNpb25cbiAqIEB0eXBlIHtzdHJpbmd9XG4gKi9cbmV4cG9ydCBjb25zdCBWRVJTSU9OID0gJzUuMTUuMCc7XG5leHBvcnQgY29uc3QgUFVCTElDX1ZFUlNJT04gPSAnNSc7XG4iLCJpbXBvcnQgeyBQVUJMSUNfVkVSU0lPTiB9IGZyb20gJy4uL3ZlcnNpb24uanMnO1xuXG5pZiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcpXG5cdC8vIEB0cy1pZ25vcmVcblx0KHdpbmRvdy5fX3N2ZWx0ZSB8fD0geyB2OiBuZXcgU2V0KCkgfSkudi5hZGQoUFVCTElDX1ZFUlNJT04pO1xuIiwiZXhwb3J0IGNvbnN0IEVBQ0hfSVRFTV9SRUFDVElWRSA9IDE7XG5leHBvcnQgY29uc3QgRUFDSF9JTkRFWF9SRUFDVElWRSA9IDEgPDwgMTtcbi8qKiBTZWUgRWFjaEJsb2NrIGludGVyZmFjZSBtZXRhZGF0YS5pc19jb250cm9sbGVkIGZvciBhbiBleHBsYW5hdGlvbiB3aGF0IHRoaXMgaXMgKi9cbmV4cG9ydCBjb25zdCBFQUNIX0lTX0NPTlRST0xMRUQgPSAxIDw8IDI7XG5leHBvcnQgY29uc3QgRUFDSF9JU19BTklNQVRFRCA9IDEgPDwgMztcbmV4cG9ydCBjb25zdCBFQUNIX0lURU1fSU1NVVRBQkxFID0gMSA8PCA0O1xuXG5leHBvcnQgY29uc3QgUFJPUFNfSVNfSU1NVVRBQkxFID0gMTtcbmV4cG9ydCBjb25zdCBQUk9QU19JU19SVU5FUyA9IDEgPDwgMTtcbmV4cG9ydCBjb25zdCBQUk9QU19JU19VUERBVEVEID0gMSA8PCAyO1xuZXhwb3J0IGNvbnN0IFBST1BTX0lTX0JJTkRBQkxFID0gMSA8PCAzO1xuZXhwb3J0IGNvbnN0IFBST1BTX0lTX0xBWllfSU5JVElBTCA9IDEgPDwgNDtcblxuZXhwb3J0IGNvbnN0IFRSQU5TSVRJT05fSU4gPSAxO1xuZXhwb3J0IGNvbnN0IFRSQU5TSVRJT05fT1VUID0gMSA8PCAxO1xuZXhwb3J0IGNvbnN0IFRSQU5TSVRJT05fR0xPQkFMID0gMSA8PCAyO1xuXG5leHBvcnQgY29uc3QgVEVNUExBVEVfRlJBR01FTlQgPSAxO1xuZXhwb3J0IGNvbnN0IFRFTVBMQVRFX1VTRV9JTVBPUlRfTk9ERSA9IDEgPDwgMTtcblxuZXhwb3J0IGNvbnN0IEhZRFJBVElPTl9TVEFSVCA9ICdbJztcbi8qKiB1c2VkIHRvIGluZGljYXRlIHRoYXQgYW4gYHs6ZWxzZX0uLi5gIGJsb2NrIHdhcyByZW5kZXJlZCAqL1xuZXhwb3J0IGNvbnN0IEhZRFJBVElPTl9TVEFSVF9FTFNFID0gJ1shJztcbmV4cG9ydCBjb25zdCBIWURSQVRJT05fRU5EID0gJ10nO1xuZXhwb3J0IGNvbnN0IEhZRFJBVElPTl9FUlJPUiA9IHt9O1xuXG5leHBvcnQgY29uc3QgRUxFTUVOVF9JU19OQU1FU1BBQ0VEID0gMTtcbmV4cG9ydCBjb25zdCBFTEVNRU5UX1BSRVNFUlZFX0FUVFJJQlVURV9DQVNFID0gMSA8PCAxO1xuXG5leHBvcnQgY29uc3QgVU5JTklUSUFMSVpFRCA9IFN5bWJvbCgpO1xuXG4vLyBEZXYtdGltZSBjb21wb25lbnQgcHJvcGVydGllc1xuZXhwb3J0IGNvbnN0IEZJTEVOQU1FID0gU3ltYm9sKCdmaWxlbmFtZScpO1xuZXhwb3J0IGNvbnN0IEhNUiA9IFN5bWJvbCgnaG1yJyk7XG5cbmV4cG9ydCBjb25zdCBOQU1FU1BBQ0VfU1ZHID0gJ2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJztcbmV4cG9ydCBjb25zdCBOQU1FU1BBQ0VfTUFUSE1MID0gJ2h0dHA6Ly93d3cudzMub3JnLzE5OTgvTWF0aC9NYXRoTUwnO1xuXG4vLyB3ZSB1c2UgYSBsaXN0IG9mIGlnbm9yYWJsZSBydW50aW1lIHdhcm5pbmdzIGJlY2F1c2Ugbm90IGV2ZXJ5IHJ1bnRpbWUgd2FybmluZ1xuLy8gY2FuIGJlIGlnbm9yZWQgYW5kIHdlIHdhbnQgdG8ga2VlcCB0aGUgdmFsaWRhdGlvbiBmb3Igc3ZlbHRlLWlnbm9yZSBpbiBwbGFjZVxuZXhwb3J0IGNvbnN0IElHTk9SQUJMRV9SVU5USU1FX1dBUk5JTkdTID0gLyoqIEB0eXBlIHtjb25zdH0gKi8gKFtcblx0J3N0YXRlX3NuYXBzaG90X3VuY2xvbmVhYmxlJyxcblx0J2JpbmRpbmdfcHJvcGVydHlfbm9uX3JlYWN0aXZlJyxcblx0J2h5ZHJhdGlvbl9hdHRyaWJ1dGVfY2hhbmdlZCcsXG5cdCdoeWRyYXRpb25faHRtbF9jaGFuZ2VkJyxcblx0J293bmVyc2hpcF9pbnZhbGlkX2JpbmRpbmcnLFxuXHQnb3duZXJzaGlwX2ludmFsaWRfbXV0YXRpb24nXG5dKTtcblxuLyoqXG4gKiBXaGl0ZXNwYWNlIGluc2lkZSBvbmUgb2YgdGhlc2UgZWxlbWVudHMgd2lsbCBub3QgcmVzdWx0IGluXG4gKiBhIHdoaXRlc3BhY2Ugbm9kZSBiZWluZyBjcmVhdGVkIGluIGFueSBjaXJjdW1zdGFuY2VzLiAoVGhpc1xuICogbGlzdCBpcyBhbG1vc3QgY2VydGFpbmx5IHZlcnkgaW5jb21wbGV0ZSlcbiAqIFRPRE8gdGhpcyBpcyBjdXJyZW50bHkgdW51c2VkXG4gKi9cbmV4cG9ydCBjb25zdCBFTEVNRU5UU19XSVRIT1VUX1RFWFQgPSBbJ2F1ZGlvJywgJ2RhdGFsaXN0JywgJ2RsJywgJ29wdGdyb3VwJywgJ3NlbGVjdCcsICd2aWRlbyddO1xuIiwiY29uc3QgcmVnZXhfcmV0dXJuX2NoYXJhY3RlcnMgPSAvXFxyL2c7XG5cbi8qKlxuICogQHBhcmFtIHtzdHJpbmd9IHN0clxuICogQHJldHVybnMge3N0cmluZ31cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGhhc2goc3RyKSB7XG5cdHN0ciA9IHN0ci5yZXBsYWNlKHJlZ2V4X3JldHVybl9jaGFyYWN0ZXJzLCAnJyk7XG5cdGxldCBoYXNoID0gNTM4MTtcblx0bGV0IGkgPSBzdHIubGVuZ3RoO1xuXG5cdHdoaWxlIChpLS0pIGhhc2ggPSAoKGhhc2ggPDwgNSkgLSBoYXNoKSBeIHN0ci5jaGFyQ29kZUF0KGkpO1xuXHRyZXR1cm4gKGhhc2ggPj4+IDApLnRvU3RyaW5nKDM2KTtcbn1cblxuY29uc3QgVk9JRF9FTEVNRU5UX05BTUVTID0gW1xuXHQnYXJlYScsXG5cdCdiYXNlJyxcblx0J2JyJyxcblx0J2NvbCcsXG5cdCdjb21tYW5kJyxcblx0J2VtYmVkJyxcblx0J2hyJyxcblx0J2ltZycsXG5cdCdpbnB1dCcsXG5cdCdrZXlnZW4nLFxuXHQnbGluaycsXG5cdCdtZXRhJyxcblx0J3BhcmFtJyxcblx0J3NvdXJjZScsXG5cdCd0cmFjaycsXG5cdCd3YnInXG5dO1xuXG4vKipcbiAqIFJldHVybnMgYHRydWVgIGlmIGBuYW1lYCBpcyBvZiBhIHZvaWQgZWxlbWVudFxuICogQHBhcmFtIHtzdHJpbmd9IG5hbWVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzX3ZvaWQobmFtZSkge1xuXHRyZXR1cm4gVk9JRF9FTEVNRU5UX05BTUVTLmluY2x1ZGVzKG5hbWUpIHx8IG5hbWUudG9Mb3dlckNhc2UoKSA9PT0gJyFkb2N0eXBlJztcbn1cblxuY29uc3QgUkVTRVJWRURfV09SRFMgPSBbXG5cdCdhcmd1bWVudHMnLFxuXHQnYXdhaXQnLFxuXHQnYnJlYWsnLFxuXHQnY2FzZScsXG5cdCdjYXRjaCcsXG5cdCdjbGFzcycsXG5cdCdjb25zdCcsXG5cdCdjb250aW51ZScsXG5cdCdkZWJ1Z2dlcicsXG5cdCdkZWZhdWx0Jyxcblx0J2RlbGV0ZScsXG5cdCdkbycsXG5cdCdlbHNlJyxcblx0J2VudW0nLFxuXHQnZXZhbCcsXG5cdCdleHBvcnQnLFxuXHQnZXh0ZW5kcycsXG5cdCdmYWxzZScsXG5cdCdmaW5hbGx5Jyxcblx0J2ZvcicsXG5cdCdmdW5jdGlvbicsXG5cdCdpZicsXG5cdCdpbXBsZW1lbnRzJyxcblx0J2ltcG9ydCcsXG5cdCdpbicsXG5cdCdpbnN0YW5jZW9mJyxcblx0J2ludGVyZmFjZScsXG5cdCdsZXQnLFxuXHQnbmV3Jyxcblx0J251bGwnLFxuXHQncGFja2FnZScsXG5cdCdwcml2YXRlJyxcblx0J3Byb3RlY3RlZCcsXG5cdCdwdWJsaWMnLFxuXHQncmV0dXJuJyxcblx0J3N0YXRpYycsXG5cdCdzdXBlcicsXG5cdCdzd2l0Y2gnLFxuXHQndGhpcycsXG5cdCd0aHJvdycsXG5cdCd0cnVlJyxcblx0J3RyeScsXG5cdCd0eXBlb2YnLFxuXHQndmFyJyxcblx0J3ZvaWQnLFxuXHQnd2hpbGUnLFxuXHQnd2l0aCcsXG5cdCd5aWVsZCdcbl07XG5cbi8qKlxuICogUmV0dXJucyBgdHJ1ZWAgaWYgYHdvcmRgIGlzIGEgcmVzZXJ2ZWQgSmF2YVNjcmlwdCBrZXl3b3JkXG4gKiBAcGFyYW0ge3N0cmluZ30gd29yZFxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNfcmVzZXJ2ZWQod29yZCkge1xuXHRyZXR1cm4gUkVTRVJWRURfV09SRFMuaW5jbHVkZXMod29yZCk7XG59XG5cbi8qKlxuICogQHBhcmFtIHtzdHJpbmd9IG5hbWVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzX2NhcHR1cmVfZXZlbnQobmFtZSkge1xuXHRyZXR1cm4gbmFtZS5lbmRzV2l0aCgnY2FwdHVyZScpICYmIG5hbWUgIT09ICdnb3Rwb2ludGVyY2FwdHVyZScgJiYgbmFtZSAhPT0gJ2xvc3Rwb2ludGVyY2FwdHVyZSc7XG59XG5cbi8qKiBMaXN0IG9mIEVsZW1lbnQgZXZlbnRzIHRoYXQgd2lsbCBiZSBkZWxlZ2F0ZWQgKi9cbmNvbnN0IERFTEVHQVRFRF9FVkVOVFMgPSBbXG5cdCdiZWZvcmVpbnB1dCcsXG5cdCdjbGljaycsXG5cdCdjaGFuZ2UnLFxuXHQnZGJsY2xpY2snLFxuXHQnY29udGV4dG1lbnUnLFxuXHQnZm9jdXNpbicsXG5cdCdmb2N1c291dCcsXG5cdCdpbnB1dCcsXG5cdCdrZXlkb3duJyxcblx0J2tleXVwJyxcblx0J21vdXNlZG93bicsXG5cdCdtb3VzZW1vdmUnLFxuXHQnbW91c2VvdXQnLFxuXHQnbW91c2VvdmVyJyxcblx0J21vdXNldXAnLFxuXHQncG9pbnRlcmRvd24nLFxuXHQncG9pbnRlcm1vdmUnLFxuXHQncG9pbnRlcm91dCcsXG5cdCdwb2ludGVyb3ZlcicsXG5cdCdwb2ludGVydXAnLFxuXHQndG91Y2hlbmQnLFxuXHQndG91Y2htb3ZlJyxcblx0J3RvdWNoc3RhcnQnXG5dO1xuXG4vKipcbiAqIFJldHVybnMgYHRydWVgIGlmIGBldmVudF9uYW1lYCBpcyBhIGRlbGVnYXRlZCBldmVudFxuICogQHBhcmFtIHtzdHJpbmd9IGV2ZW50X25hbWVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzX2RlbGVnYXRlZChldmVudF9uYW1lKSB7XG5cdHJldHVybiBERUxFR0FURURfRVZFTlRTLmluY2x1ZGVzKGV2ZW50X25hbWUpO1xufVxuXG4vKipcbiAqIEF0dHJpYnV0ZXMgdGhhdCBhcmUgYm9vbGVhbiwgaS5lLiB0aGV5IGFyZSBwcmVzZW50IG9yIG5vdCBwcmVzZW50LlxuICovXG5jb25zdCBET01fQk9PTEVBTl9BVFRSSUJVVEVTID0gW1xuXHQnYWxsb3dmdWxsc2NyZWVuJyxcblx0J2FzeW5jJyxcblx0J2F1dG9mb2N1cycsXG5cdCdhdXRvcGxheScsXG5cdCdjaGVja2VkJyxcblx0J2NvbnRyb2xzJyxcblx0J2RlZmF1bHQnLFxuXHQnZGlzYWJsZWQnLFxuXHQnZm9ybW5vdmFsaWRhdGUnLFxuXHQnaGlkZGVuJyxcblx0J2luZGV0ZXJtaW5hdGUnLFxuXHQnaXNtYXAnLFxuXHQnbG9vcCcsXG5cdCdtdWx0aXBsZScsXG5cdCdtdXRlZCcsXG5cdCdub21vZHVsZScsXG5cdCdub3ZhbGlkYXRlJyxcblx0J29wZW4nLFxuXHQncGxheXNpbmxpbmUnLFxuXHQncmVhZG9ubHknLFxuXHQncmVxdWlyZWQnLFxuXHQncmV2ZXJzZWQnLFxuXHQnc2VhbWxlc3MnLFxuXHQnc2VsZWN0ZWQnLFxuXHQnd2Via2l0ZGlyZWN0b3J5J1xuXTtcblxuLyoqXG4gKiBSZXR1cm5zIGB0cnVlYCBpZiBgbmFtZWAgaXMgYSBib29sZWFuIGF0dHJpYnV0ZVxuICogQHBhcmFtIHtzdHJpbmd9IG5hbWVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzX2Jvb2xlYW5fYXR0cmlidXRlKG5hbWUpIHtcblx0cmV0dXJuIERPTV9CT09MRUFOX0FUVFJJQlVURVMuaW5jbHVkZXMobmFtZSk7XG59XG5cbi8qKlxuICogQHR5cGUge1JlY29yZDxzdHJpbmcsIHN0cmluZz59XG4gKiBMaXN0IG9mIGF0dHJpYnV0ZSBuYW1lcyB0aGF0IHNob3VsZCBiZSBhbGlhc2VkIHRvIHRoZWlyIHByb3BlcnR5IG5hbWVzXG4gKiBiZWNhdXNlIHRoZXkgYmVoYXZlIGRpZmZlcmVudGx5IGJldHdlZW4gc2V0dGluZyB0aGVtIGFzIGFuIGF0dHJpYnV0ZSBhbmRcbiAqIHNldHRpbmcgdGhlbSBhcyBhIHByb3BlcnR5LlxuICovXG5jb25zdCBBVFRSSUJVVEVfQUxJQVNFUyA9IHtcblx0Ly8gbm8gYGNsYXNzOiAnY2xhc3NOYW1lJ2AgYmVjYXVzZSB3ZSBoYW5kbGUgdGhhdCBzZXBhcmF0ZWx5XG5cdGZvcm1ub3ZhbGlkYXRlOiAnZm9ybU5vVmFsaWRhdGUnLFxuXHRpc21hcDogJ2lzTWFwJyxcblx0bm9tb2R1bGU6ICdub01vZHVsZScsXG5cdHBsYXlzaW5saW5lOiAncGxheXNJbmxpbmUnLFxuXHRyZWFkb25seTogJ3JlYWRPbmx5Jyxcblx0ZGVmYXVsdHZhbHVlOiAnZGVmYXVsdFZhbHVlJyxcblx0ZGVmYXVsdGNoZWNrZWQ6ICdkZWZhdWx0Q2hlY2tlZCcsXG5cdHNyY29iamVjdDogJ3NyY09iamVjdCdcbn07XG5cbi8qKlxuICogQHBhcmFtIHtzdHJpbmd9IG5hbWVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG5vcm1hbGl6ZV9hdHRyaWJ1dGUobmFtZSkge1xuXHRuYW1lID0gbmFtZS50b0xvd2VyQ2FzZSgpO1xuXHRyZXR1cm4gQVRUUklCVVRFX0FMSUFTRVNbbmFtZV0gPz8gbmFtZTtcbn1cblxuY29uc3QgRE9NX1BST1BFUlRJRVMgPSBbXG5cdC4uLkRPTV9CT09MRUFOX0FUVFJJQlVURVMsXG5cdCdmb3JtTm9WYWxpZGF0ZScsXG5cdCdpc01hcCcsXG5cdCdub01vZHVsZScsXG5cdCdwbGF5c0lubGluZScsXG5cdCdyZWFkT25seScsXG5cdCd2YWx1ZScsXG5cdCdpbmVydCcsXG5cdCd2b2x1bWUnLFxuXHQnZGVmYXVsdFZhbHVlJyxcblx0J2RlZmF1bHRDaGVja2VkJyxcblx0J3NyY09iamVjdCdcbl07XG5cbi8qKlxuICogQHBhcmFtIHtzdHJpbmd9IG5hbWVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzX2RvbV9wcm9wZXJ0eShuYW1lKSB7XG5cdHJldHVybiBET01fUFJPUEVSVElFUy5pbmNsdWRlcyhuYW1lKTtcbn1cblxuY29uc3QgTk9OX1NUQVRJQ19QUk9QRVJUSUVTID0gWydhdXRvZm9jdXMnLCAnbXV0ZWQnLCAnZGVmYXVsdFZhbHVlJywgJ2RlZmF1bHRDaGVja2VkJ107XG5cbi8qKlxuICogUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIGdpdmVuIGF0dHJpYnV0ZSBjYW5ub3QgYmUgc2V0IHRocm91Z2ggdGhlIHRlbXBsYXRlXG4gKiBzdHJpbmcsIGkuZS4gbmVlZHMgc29tZSBraW5kIG9mIEphdmFTY3JpcHQgaGFuZGxpbmcgdG8gd29yay5cbiAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjYW5ub3RfYmVfc2V0X3N0YXRpY2FsbHkobmFtZSkge1xuXHRyZXR1cm4gTk9OX1NUQVRJQ19QUk9QRVJUSUVTLmluY2x1ZGVzKG5hbWUpO1xufVxuXG4vKipcbiAqIFN1YnNldCBvZiBkZWxlZ2F0ZWQgZXZlbnRzIHdoaWNoIHNob3VsZCBiZSBwYXNzaXZlIGJ5IGRlZmF1bHQuXG4gKiBUaGVzZSB0d28gYXJlIGFscmVhZHkgcGFzc2l2ZSB2aWEgYnJvd3NlciBkZWZhdWx0cyBvbiB3aW5kb3csIGRvY3VtZW50IGFuZCBib2R5LlxuICogQnV0IHNpbmNlXG4gKiAtIHdlJ3JlIGRlbGVnYXRpbmcgdGhlbVxuICogLSB0aGV5IGhhcHBlbiBvZnRlblxuICogLSB0aGV5IGFwcGx5IHRvIG1vYmlsZSB3aGljaCBpcyBnZW5lcmFsbHkgbGVzcyBwZXJmb3JtYW50XG4gKiB3ZSdyZSBtYXJraW5nIHRoZW0gYXMgcGFzc2l2ZSBieSBkZWZhdWx0IGZvciBvdGhlciBlbGVtZW50cywgdG9vLlxuICovXG5jb25zdCBQQVNTSVZFX0VWRU5UUyA9IFsndG91Y2hzdGFydCcsICd0b3VjaG1vdmUnXTtcblxuLyoqXG4gKiBSZXR1cm5zIGB0cnVlYCBpZiBgbmFtZWAgaXMgYSBwYXNzaXZlIGV2ZW50XG4gKiBAcGFyYW0ge3N0cmluZ30gbmFtZVxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNfcGFzc2l2ZV9ldmVudChuYW1lKSB7XG5cdHJldHVybiBQQVNTSVZFX0VWRU5UUy5pbmNsdWRlcyhuYW1lKTtcbn1cblxuY29uc3QgQ09OVEVOVF9FRElUQUJMRV9CSU5ESU5HUyA9IFsndGV4dENvbnRlbnQnLCAnaW5uZXJIVE1MJywgJ2lubmVyVGV4dCddO1xuXG4vKiogQHBhcmFtIHtzdHJpbmd9IG5hbWUgKi9cbmV4cG9ydCBmdW5jdGlvbiBpc19jb250ZW50X2VkaXRhYmxlX2JpbmRpbmcobmFtZSkge1xuXHRyZXR1cm4gQ09OVEVOVF9FRElUQUJMRV9CSU5ESU5HUy5pbmNsdWRlcyhuYW1lKTtcbn1cblxuY29uc3QgTE9BRF9FUlJPUl9FTEVNRU5UUyA9IFtcblx0J2JvZHknLFxuXHQnZW1iZWQnLFxuXHQnaWZyYW1lJyxcblx0J2ltZycsXG5cdCdsaW5rJyxcblx0J29iamVjdCcsXG5cdCdzY3JpcHQnLFxuXHQnc3R5bGUnLFxuXHQndHJhY2snXG5dO1xuXG4vKipcbiAqIFJldHVybnMgYHRydWVgIGlmIHRoZSBlbGVtZW50IGVtaXRzIGBsb2FkYCBhbmQgYGVycm9yYCBldmVudHNcbiAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc19sb2FkX2Vycm9yX2VsZW1lbnQobmFtZSkge1xuXHRyZXR1cm4gTE9BRF9FUlJPUl9FTEVNRU5UUy5pbmNsdWRlcyhuYW1lKTtcbn1cblxuY29uc3QgU1ZHX0VMRU1FTlRTID0gW1xuXHQnYWx0R2x5cGgnLFxuXHQnYWx0R2x5cGhEZWYnLFxuXHQnYWx0R2x5cGhJdGVtJyxcblx0J2FuaW1hdGUnLFxuXHQnYW5pbWF0ZUNvbG9yJyxcblx0J2FuaW1hdGVNb3Rpb24nLFxuXHQnYW5pbWF0ZVRyYW5zZm9ybScsXG5cdCdjaXJjbGUnLFxuXHQnY2xpcFBhdGgnLFxuXHQnY29sb3ItcHJvZmlsZScsXG5cdCdjdXJzb3InLFxuXHQnZGVmcycsXG5cdCdkZXNjJyxcblx0J2Rpc2NhcmQnLFxuXHQnZWxsaXBzZScsXG5cdCdmZUJsZW5kJyxcblx0J2ZlQ29sb3JNYXRyaXgnLFxuXHQnZmVDb21wb25lbnRUcmFuc2ZlcicsXG5cdCdmZUNvbXBvc2l0ZScsXG5cdCdmZUNvbnZvbHZlTWF0cml4Jyxcblx0J2ZlRGlmZnVzZUxpZ2h0aW5nJyxcblx0J2ZlRGlzcGxhY2VtZW50TWFwJyxcblx0J2ZlRGlzdGFudExpZ2h0Jyxcblx0J2ZlRHJvcFNoYWRvdycsXG5cdCdmZUZsb29kJyxcblx0J2ZlRnVuY0EnLFxuXHQnZmVGdW5jQicsXG5cdCdmZUZ1bmNHJyxcblx0J2ZlRnVuY1InLFxuXHQnZmVHYXVzc2lhbkJsdXInLFxuXHQnZmVJbWFnZScsXG5cdCdmZU1lcmdlJyxcblx0J2ZlTWVyZ2VOb2RlJyxcblx0J2ZlTW9ycGhvbG9neScsXG5cdCdmZU9mZnNldCcsXG5cdCdmZVBvaW50TGlnaHQnLFxuXHQnZmVTcGVjdWxhckxpZ2h0aW5nJyxcblx0J2ZlU3BvdExpZ2h0Jyxcblx0J2ZlVGlsZScsXG5cdCdmZVR1cmJ1bGVuY2UnLFxuXHQnZmlsdGVyJyxcblx0J2ZvbnQnLFxuXHQnZm9udC1mYWNlJyxcblx0J2ZvbnQtZmFjZS1mb3JtYXQnLFxuXHQnZm9udC1mYWNlLW5hbWUnLFxuXHQnZm9udC1mYWNlLXNyYycsXG5cdCdmb250LWZhY2UtdXJpJyxcblx0J2ZvcmVpZ25PYmplY3QnLFxuXHQnZycsXG5cdCdnbHlwaCcsXG5cdCdnbHlwaFJlZicsXG5cdCdoYXRjaCcsXG5cdCdoYXRjaHBhdGgnLFxuXHQnaGtlcm4nLFxuXHQnaW1hZ2UnLFxuXHQnbGluZScsXG5cdCdsaW5lYXJHcmFkaWVudCcsXG5cdCdtYXJrZXInLFxuXHQnbWFzaycsXG5cdCdtZXNoJyxcblx0J21lc2hncmFkaWVudCcsXG5cdCdtZXNocGF0Y2gnLFxuXHQnbWVzaHJvdycsXG5cdCdtZXRhZGF0YScsXG5cdCdtaXNzaW5nLWdseXBoJyxcblx0J21wYXRoJyxcblx0J3BhdGgnLFxuXHQncGF0dGVybicsXG5cdCdwb2x5Z29uJyxcblx0J3BvbHlsaW5lJyxcblx0J3JhZGlhbEdyYWRpZW50Jyxcblx0J3JlY3QnLFxuXHQnc2V0Jyxcblx0J3NvbGlkY29sb3InLFxuXHQnc3RvcCcsXG5cdCdzdmcnLFxuXHQnc3dpdGNoJyxcblx0J3N5bWJvbCcsXG5cdCd0ZXh0Jyxcblx0J3RleHRQYXRoJyxcblx0J3RyZWYnLFxuXHQndHNwYW4nLFxuXHQndW5rbm93bicsXG5cdCd1c2UnLFxuXHQndmlldycsXG5cdCd2a2Vybidcbl07XG5cbi8qKiBAcGFyYW0ge3N0cmluZ30gbmFtZSAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzX3N2ZyhuYW1lKSB7XG5cdHJldHVybiBTVkdfRUxFTUVOVFMuaW5jbHVkZXMobmFtZSk7XG59XG5cbmNvbnN0IE1BVEhNTF9FTEVNRU5UUyA9IFtcblx0J2Fubm90YXRpb24nLFxuXHQnYW5ub3RhdGlvbi14bWwnLFxuXHQnbWFjdGlvbicsXG5cdCdtYXRoJyxcblx0J21lcnJvcicsXG5cdCdtZnJhYycsXG5cdCdtaScsXG5cdCdtbXVsdGlzY3JpcHRzJyxcblx0J21uJyxcblx0J21vJyxcblx0J21vdmVyJyxcblx0J21wYWRkZWQnLFxuXHQnbXBoYW50b20nLFxuXHQnbXByZXNjcmlwdHMnLFxuXHQnbXJvb3QnLFxuXHQnbXJvdycsXG5cdCdtcycsXG5cdCdtc3BhY2UnLFxuXHQnbXNxcnQnLFxuXHQnbXN0eWxlJyxcblx0J21zdWInLFxuXHQnbXN1YnN1cCcsXG5cdCdtc3VwJyxcblx0J210YWJsZScsXG5cdCdtdGQnLFxuXHQnbXRleHQnLFxuXHQnbXRyJyxcblx0J211bmRlcicsXG5cdCdtdW5kZXJvdmVyJyxcblx0J3NlbWFudGljcydcbl07XG5cbi8qKiBAcGFyYW0ge3N0cmluZ30gbmFtZSAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzX21hdGhtbChuYW1lKSB7XG5cdHJldHVybiBNQVRITUxfRUxFTUVOVFMuaW5jbHVkZXMobmFtZSk7XG59XG5cbmNvbnN0IFJVTkVTID0gLyoqIEB0eXBlIHtjb25zdH0gKi8gKFtcblx0JyRzdGF0ZScsXG5cdCckc3RhdGUucmF3Jyxcblx0JyRzdGF0ZS5zbmFwc2hvdCcsXG5cdCckcHJvcHMnLFxuXHQnJGJpbmRhYmxlJyxcblx0JyRkZXJpdmVkJyxcblx0JyRkZXJpdmVkLmJ5Jyxcblx0JyRlZmZlY3QnLFxuXHQnJGVmZmVjdC5wcmUnLFxuXHQnJGVmZmVjdC50cmFja2luZycsXG5cdCckZWZmZWN0LnJvb3QnLFxuXHQnJGluc3BlY3QnLFxuXHQnJGluc3BlY3QoKS53aXRoJyxcblx0JyRpbnNwZWN0LnRyYWNlJyxcblx0JyRob3N0J1xuXSk7XG5cbi8qKlxuICogQHBhcmFtIHtzdHJpbmd9IG5hbWVcbiAqIEByZXR1cm5zIHtuYW1lIGlzIFJVTkVTW251bWJlcl19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc19ydW5lKG5hbWUpIHtcblx0cmV0dXJuIFJVTkVTLmluY2x1ZGVzKC8qKiBAdHlwZSB7UlVORVNbbnVtYmVyXX0gKi8gKG5hbWUpKTtcbn1cblxuLyoqIExpc3Qgb2YgZWxlbWVudHMgdGhhdCByZXF1aXJlIHJhdyBjb250ZW50cyBhbmQgc2hvdWxkIG5vdCBoYXZlIFNTUiBjb21tZW50cyBwdXQgaW4gdGhlbSAqL1xuY29uc3QgUkFXX1RFWFRfRUxFTUVOVFMgPSAvKiogQHR5cGUge2NvbnN0fSAqLyAoWyd0ZXh0YXJlYScsICdzY3JpcHQnLCAnc3R5bGUnLCAndGl0bGUnXSk7XG5cbi8qKiBAcGFyYW0ge3N0cmluZ30gbmFtZSAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzX3Jhd190ZXh0X2VsZW1lbnQobmFtZSkge1xuXHRyZXR1cm4gUkFXX1RFWFRfRUxFTUVOVFMuaW5jbHVkZXMoLyoqIEB0eXBlIHtSQVdfVEVYVF9FTEVNRU5UU1tudW1iZXJdfSAqLyAobmFtZSkpO1xufVxuXG4vKipcbiAqIFByZXZlbnQgZGV2dG9vbHMgdHJ5aW5nIHRvIG1ha2UgYGxvY2F0aW9uYCBhIGNsaWNrYWJsZSBsaW5rIGJ5IGluc2VydGluZyBhIHplcm8td2lkdGggc3BhY2VcbiAqIEBwYXJhbSB7c3RyaW5nIHwgdW5kZWZpbmVkfSBsb2NhdGlvblxuICovXG5leHBvcnQgZnVuY3Rpb24gc2FuaXRpemVfbG9jYXRpb24obG9jYXRpb24pIHtcblx0cmV0dXJuIGxvY2F0aW9uPy5yZXBsYWNlKC9cXC8vZywgJy9cXHUyMDBiJyk7XG59XG4iLCJleHBvcnQgZGVmYXVsdCBmYWxzZTtcbiIsIi8vIFN0b3JlIHRoZSByZWZlcmVuY2VzIHRvIGdsb2JhbHMgaW4gY2FzZSBzb21lb25lIHRyaWVzIHRvIG1vbmtleSBwYXRjaCB0aGVzZSwgY2F1c2luZyB0aGUgYmVsb3dcbi8vIHRvIGRlLW9wdCAodGhpcyBvY2N1cnMgb2Z0ZW4gd2hlbiB1c2luZyBwb3B1bGFyIGV4dGVuc2lvbnMpLlxuZXhwb3J0IHZhciBpc19hcnJheSA9IEFycmF5LmlzQXJyYXk7XG5leHBvcnQgdmFyIGFycmF5X2Zyb20gPSBBcnJheS5mcm9tO1xuZXhwb3J0IHZhciBvYmplY3Rfa2V5cyA9IE9iamVjdC5rZXlzO1xuZXhwb3J0IHZhciBkZWZpbmVfcHJvcGVydHkgPSBPYmplY3QuZGVmaW5lUHJvcGVydHk7XG5leHBvcnQgdmFyIGdldF9kZXNjcmlwdG9yID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcjtcbmV4cG9ydCB2YXIgZ2V0X2Rlc2NyaXB0b3JzID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcnM7XG5leHBvcnQgdmFyIG9iamVjdF9wcm90b3R5cGUgPSBPYmplY3QucHJvdG90eXBlO1xuZXhwb3J0IHZhciBhcnJheV9wcm90b3R5cGUgPSBBcnJheS5wcm90b3R5cGU7XG5leHBvcnQgdmFyIGdldF9wcm90b3R5cGVfb2YgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2Y7XG5cbi8qKlxuICogQHBhcmFtIHthbnl9IHRoaW5nXG4gKiBAcmV0dXJucyB7dGhpbmcgaXMgRnVuY3Rpb259XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc19mdW5jdGlvbih0aGluZykge1xuXHRyZXR1cm4gdHlwZW9mIHRoaW5nID09PSAnZnVuY3Rpb24nO1xufVxuXG5leHBvcnQgY29uc3Qgbm9vcCA9ICgpID0+IHt9O1xuXG4vLyBBZGFwdGVkIGZyb20gaHR0cHM6Ly9naXRodWIuY29tL3RoZW4vaXMtcHJvbWlzZS9ibG9iL21hc3Rlci9pbmRleC5qc1xuLy8gRGlzdHJpYnV0ZWQgdW5kZXIgTUlUIExpY2Vuc2UgaHR0cHM6Ly9naXRodWIuY29tL3RoZW4vaXMtcHJvbWlzZS9ibG9iL21hc3Rlci9MSUNFTlNFXG5cbi8qKlxuICogQHRlbXBsYXRlIFtUPWFueV1cbiAqIEBwYXJhbSB7YW55fSB2YWx1ZVxuICogQHJldHVybnMge3ZhbHVlIGlzIFByb21pc2VMaWtlPFQ+fVxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNfcHJvbWlzZSh2YWx1ZSkge1xuXHRyZXR1cm4gdHlwZW9mIHZhbHVlPy50aGVuID09PSAnZnVuY3Rpb24nO1xufVxuXG4vKiogQHBhcmFtIHtGdW5jdGlvbn0gZm4gKi9cbmV4cG9ydCBmdW5jdGlvbiBydW4oZm4pIHtcblx0cmV0dXJuIGZuKCk7XG59XG5cbi8qKiBAcGFyYW0ge0FycmF5PCgpID0+IHZvaWQ+fSBhcnIgKi9cbmV4cG9ydCBmdW5jdGlvbiBydW5fYWxsKGFycikge1xuXHRmb3IgKHZhciBpID0gMDsgaSA8IGFyci5sZW5ndGg7IGkrKykge1xuXHRcdGFycltpXSgpO1xuXHR9XG59XG5cbi8qKlxuICogVE9ETyByZXBsYWNlIHdpdGggUHJvbWlzZS53aXRoUmVzb2x2ZXJzIG9uY2Ugc3VwcG9ydGVkIHdpZGVseSBlbm91Z2hcbiAqIEB0ZW1wbGF0ZSBUXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkZWZlcnJlZCgpIHtcblx0LyoqIEB0eXBlIHsodmFsdWU6IFQpID0+IHZvaWR9ICovXG5cdHZhciByZXNvbHZlO1xuXG5cdC8qKiBAdHlwZSB7KHJlYXNvbjogYW55KSA9PiB2b2lkfSAqL1xuXHR2YXIgcmVqZWN0O1xuXG5cdC8qKiBAdHlwZSB7UHJvbWlzZTxUPn0gKi9cblx0dmFyIHByb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzLCByZWopID0+IHtcblx0XHRyZXNvbHZlID0gcmVzO1xuXHRcdHJlamVjdCA9IHJlajtcblx0fSk7XG5cblx0Ly8gQHRzLWV4cGVjdC1lcnJvclxuXHRyZXR1cm4geyBwcm9taXNlLCByZXNvbHZlLCByZWplY3QgfTtcbn1cblxuLyoqXG4gKiBAdGVtcGxhdGUgVlxuICogQHBhcmFtIHtWfSB2YWx1ZVxuICogQHBhcmFtIHtWIHwgKCgpID0+IFYpfSBmYWxsYmFja1xuICogQHBhcmFtIHtib29sZWFufSBbbGF6eV1cbiAqIEByZXR1cm5zIHtWfVxuICovXG5leHBvcnQgZnVuY3Rpb24gZmFsbGJhY2sodmFsdWUsIGZhbGxiYWNrLCBsYXp5ID0gZmFsc2UpIHtcblx0cmV0dXJuIHZhbHVlID09PSB1bmRlZmluZWRcblx0XHQ/IGxhenlcblx0XHRcdD8gLyoqIEB0eXBlIHsoKSA9PiBWfSAqLyAoZmFsbGJhY2spKClcblx0XHRcdDogLyoqIEB0eXBlIHtWfSAqLyAoZmFsbGJhY2spXG5cdFx0OiB2YWx1ZTtcbn1cbiIsImV4cG9ydCBjb25zdCBERVJJVkVEID0gMSA8PCAxO1xuZXhwb3J0IGNvbnN0IEVGRkVDVCA9IDEgPDwgMjtcbmV4cG9ydCBjb25zdCBSRU5ERVJfRUZGRUNUID0gMSA8PCAzO1xuZXhwb3J0IGNvbnN0IEJMT0NLX0VGRkVDVCA9IDEgPDwgNDtcbmV4cG9ydCBjb25zdCBCUkFOQ0hfRUZGRUNUID0gMSA8PCA1O1xuZXhwb3J0IGNvbnN0IFJPT1RfRUZGRUNUID0gMSA8PCA2O1xuZXhwb3J0IGNvbnN0IEJPVU5EQVJZX0VGRkVDVCA9IDEgPDwgNztcbmV4cG9ydCBjb25zdCBVTk9XTkVEID0gMSA8PCA4O1xuZXhwb3J0IGNvbnN0IERJU0NPTk5FQ1RFRCA9IDEgPDwgOTtcbmV4cG9ydCBjb25zdCBDTEVBTiA9IDEgPDwgMTA7XG5leHBvcnQgY29uc3QgRElSVFkgPSAxIDw8IDExO1xuZXhwb3J0IGNvbnN0IE1BWUJFX0RJUlRZID0gMSA8PCAxMjtcbmV4cG9ydCBjb25zdCBJTkVSVCA9IDEgPDwgMTM7XG5leHBvcnQgY29uc3QgREVTVFJPWUVEID0gMSA8PCAxNDtcbmV4cG9ydCBjb25zdCBFRkZFQ1RfUkFOID0gMSA8PCAxNTtcbi8qKiAnVHJhbnNwYXJlbnQnIGVmZmVjdHMgZG8gbm90IGNyZWF0ZSBhIHRyYW5zaXRpb24gYm91bmRhcnkgKi9cbmV4cG9ydCBjb25zdCBFRkZFQ1RfVFJBTlNQQVJFTlQgPSAxIDw8IDE2O1xuLyoqIFN2ZWx0ZSA0IGxlZ2FjeSBtb2RlIHByb3BzIG5lZWQgdG8gYmUgaGFuZGxlZCB3aXRoIGRlcml2ZWRzIGFuZCBiZSByZWNvZ25pemVkIGVsc2V3aGVyZSwgaGVuY2UgdGhlIGRlZGljYXRlZCBmbGFnICovXG5leHBvcnQgY29uc3QgTEVHQUNZX0RFUklWRURfUFJPUCA9IDEgPDwgMTc7XG5leHBvcnQgY29uc3QgSU5TUEVDVF9FRkZFQ1QgPSAxIDw8IDE4O1xuZXhwb3J0IGNvbnN0IEhFQURfRUZGRUNUID0gMSA8PCAxOTtcbmV4cG9ydCBjb25zdCBFRkZFQ1RfSEFTX0RFUklWRUQgPSAxIDw8IDIwO1xuXG5leHBvcnQgY29uc3QgU1RBVEVfU1lNQk9MID0gU3ltYm9sKCckc3RhdGUnKTtcbmV4cG9ydCBjb25zdCBTVEFURV9TWU1CT0xfTUVUQURBVEEgPSBTeW1ib2woJyRzdGF0ZSBtZXRhZGF0YScpO1xuZXhwb3J0IGNvbnN0IExFR0FDWV9QUk9QUyA9IFN5bWJvbCgnbGVnYWN5IHByb3BzJyk7XG5leHBvcnQgY29uc3QgTE9BRElOR19BVFRSX1NZTUJPTCA9IFN5bWJvbCgnJyk7XG4iLCIvKiogQGltcG9ydCB7IEVxdWFscyB9IGZyb20gJyNjbGllbnQnICovXG4vKiogQHR5cGUge0VxdWFsc30gKi9cbmV4cG9ydCBmdW5jdGlvbiBlcXVhbHModmFsdWUpIHtcblx0cmV0dXJuIHZhbHVlID09PSB0aGlzLnY7XG59XG5cbi8qKlxuICogQHBhcmFtIHt1bmtub3dufSBhXG4gKiBAcGFyYW0ge3Vua25vd259IGJcbiAqIEByZXR1cm5zIHtib29sZWFufVxuICovXG5leHBvcnQgZnVuY3Rpb24gc2FmZV9ub3RfZXF1YWwoYSwgYikge1xuXHRyZXR1cm4gYSAhPSBhXG5cdFx0PyBiID09IGJcblx0XHQ6IGEgIT09IGIgfHwgKGEgIT09IG51bGwgJiYgdHlwZW9mIGEgPT09ICdvYmplY3QnKSB8fCB0eXBlb2YgYSA9PT0gJ2Z1bmN0aW9uJztcbn1cblxuLyoqXG4gKiBAcGFyYW0ge3Vua25vd259IGFcbiAqIEBwYXJhbSB7dW5rbm93bn0gYlxuICogQHJldHVybnMge2Jvb2xlYW59XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBub3RfZXF1YWwoYSwgYikge1xuXHRyZXR1cm4gYSAhPT0gYjtcbn1cblxuLyoqIEB0eXBlIHtFcXVhbHN9ICovXG5leHBvcnQgZnVuY3Rpb24gc2FmZV9lcXVhbHModmFsdWUpIHtcblx0cmV0dXJuICFzYWZlX25vdF9lcXVhbCh2YWx1ZSwgdGhpcy52KTtcbn1cbiIsIi8qIFRoaXMgZmlsZSBpcyBnZW5lcmF0ZWQgYnkgc2NyaXB0cy9wcm9jZXNzLW1lc3NhZ2VzL2luZGV4LmpzLiBEbyBub3QgZWRpdCEgKi9cblxuaW1wb3J0IHsgREVWIH0gZnJvbSAnZXNtLWVudic7XG5cbi8qKlxuICogVXNpbmcgYGJpbmQ6dmFsdWVgIHRvZ2V0aGVyIHdpdGggYSBjaGVja2JveCBpbnB1dCBpcyBub3QgYWxsb3dlZC4gVXNlIGBiaW5kOmNoZWNrZWRgIGluc3RlYWRcbiAqIEByZXR1cm5zIHtuZXZlcn1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJpbmRfaW52YWxpZF9jaGVja2JveF92YWx1ZSgpIHtcblx0aWYgKERFVikge1xuXHRcdGNvbnN0IGVycm9yID0gbmV3IEVycm9yKGBiaW5kX2ludmFsaWRfY2hlY2tib3hfdmFsdWVcXG5Vc2luZyBcXGBiaW5kOnZhbHVlXFxgIHRvZ2V0aGVyIHdpdGggYSBjaGVja2JveCBpbnB1dCBpcyBub3QgYWxsb3dlZC4gVXNlIFxcYGJpbmQ6Y2hlY2tlZFxcYCBpbnN0ZWFkXFxuaHR0cHM6Ly9zdmVsdGUuZGV2L2UvYmluZF9pbnZhbGlkX2NoZWNrYm94X3ZhbHVlYCk7XG5cblx0XHRlcnJvci5uYW1lID0gJ1N2ZWx0ZSBlcnJvcic7XG5cdFx0dGhyb3cgZXJyb3I7XG5cdH0gZWxzZSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKGBodHRwczovL3N2ZWx0ZS5kZXYvZS9iaW5kX2ludmFsaWRfY2hlY2tib3hfdmFsdWVgKTtcblx0fVxufVxuXG4vKipcbiAqIENvbXBvbmVudCAlY29tcG9uZW50JSBoYXMgYW4gZXhwb3J0IG5hbWVkIGAla2V5JWAgdGhhdCBhIGNvbnN1bWVyIGNvbXBvbmVudCBpcyB0cnlpbmcgdG8gYWNjZXNzIHVzaW5nIGBiaW5kOiVrZXklYCwgd2hpY2ggaXMgZGlzYWxsb3dlZC4gSW5zdGVhZCwgdXNlIGBiaW5kOnRoaXNgIChlLmcuIGA8JW5hbWUlIGJpbmQ6dGhpcz17Y29tcG9uZW50fSAvPmApIGFuZCB0aGVuIGFjY2VzcyB0aGUgcHJvcGVydHkgb24gdGhlIGJvdW5kIGNvbXBvbmVudCBpbnN0YW5jZSAoZS5nLiBgY29tcG9uZW50LiVrZXklYClcbiAqIEBwYXJhbSB7c3RyaW5nfSBjb21wb25lbnRcbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXlcbiAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lXG4gKiBAcmV0dXJucyB7bmV2ZXJ9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBiaW5kX2ludmFsaWRfZXhwb3J0KGNvbXBvbmVudCwga2V5LCBuYW1lKSB7XG5cdGlmIChERVYpIHtcblx0XHRjb25zdCBlcnJvciA9IG5ldyBFcnJvcihgYmluZF9pbnZhbGlkX2V4cG9ydFxcbkNvbXBvbmVudCAke2NvbXBvbmVudH0gaGFzIGFuIGV4cG9ydCBuYW1lZCBcXGAke2tleX1cXGAgdGhhdCBhIGNvbnN1bWVyIGNvbXBvbmVudCBpcyB0cnlpbmcgdG8gYWNjZXNzIHVzaW5nIFxcYGJpbmQ6JHtrZXl9XFxgLCB3aGljaCBpcyBkaXNhbGxvd2VkLiBJbnN0ZWFkLCB1c2UgXFxgYmluZDp0aGlzXFxgIChlLmcuIFxcYDwke25hbWV9IGJpbmQ6dGhpcz17Y29tcG9uZW50fSAvPlxcYCkgYW5kIHRoZW4gYWNjZXNzIHRoZSBwcm9wZXJ0eSBvbiB0aGUgYm91bmQgY29tcG9uZW50IGluc3RhbmNlIChlLmcuIFxcYGNvbXBvbmVudC4ke2tleX1cXGApXFxuaHR0cHM6Ly9zdmVsdGUuZGV2L2UvYmluZF9pbnZhbGlkX2V4cG9ydGApO1xuXG5cdFx0ZXJyb3IubmFtZSA9ICdTdmVsdGUgZXJyb3InO1xuXHRcdHRocm93IGVycm9yO1xuXHR9IGVsc2Uge1xuXHRcdHRocm93IG5ldyBFcnJvcihgaHR0cHM6Ly9zdmVsdGUuZGV2L2UvYmluZF9pbnZhbGlkX2V4cG9ydGApO1xuXHR9XG59XG5cbi8qKlxuICogQSBjb21wb25lbnQgaXMgYXR0ZW1wdGluZyB0byBiaW5kIHRvIGEgbm9uLWJpbmRhYmxlIHByb3BlcnR5IGAla2V5JWAgYmVsb25naW5nIHRvICVjb21wb25lbnQlIChpLmUuIGA8JW5hbWUlIGJpbmQ6JWtleSU9ey4uLn0+YCkuIFRvIG1hcmsgYSBwcm9wZXJ0eSBhcyBiaW5kYWJsZTogYGxldCB7ICVrZXklID0gJGJpbmRhYmxlKCkgfSA9ICRwcm9wcygpYFxuICogQHBhcmFtIHtzdHJpbmd9IGtleVxuICogQHBhcmFtIHtzdHJpbmd9IGNvbXBvbmVudFxuICogQHBhcmFtIHtzdHJpbmd9IG5hbWVcbiAqIEByZXR1cm5zIHtuZXZlcn1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJpbmRfbm90X2JpbmRhYmxlKGtleSwgY29tcG9uZW50LCBuYW1lKSB7XG5cdGlmIChERVYpIHtcblx0XHRjb25zdCBlcnJvciA9IG5ldyBFcnJvcihgYmluZF9ub3RfYmluZGFibGVcXG5BIGNvbXBvbmVudCBpcyBhdHRlbXB0aW5nIHRvIGJpbmQgdG8gYSBub24tYmluZGFibGUgcHJvcGVydHkgXFxgJHtrZXl9XFxgIGJlbG9uZ2luZyB0byAke2NvbXBvbmVudH0gKGkuZS4gXFxgPCR7bmFtZX0gYmluZDoke2tleX09ey4uLn0+XFxgKS4gVG8gbWFyayBhIHByb3BlcnR5IGFzIGJpbmRhYmxlOiBcXGBsZXQgeyAke2tleX0gPSAkYmluZGFibGUoKSB9ID0gJHByb3BzKClcXGBcXG5odHRwczovL3N2ZWx0ZS5kZXYvZS9iaW5kX25vdF9iaW5kYWJsZWApO1xuXG5cdFx0ZXJyb3IubmFtZSA9ICdTdmVsdGUgZXJyb3InO1xuXHRcdHRocm93IGVycm9yO1xuXHR9IGVsc2Uge1xuXHRcdHRocm93IG5ldyBFcnJvcihgaHR0cHM6Ly9zdmVsdGUuZGV2L2UvYmluZF9ub3RfYmluZGFibGVgKTtcblx0fVxufVxuXG4vKipcbiAqICVwYXJlbnQlIGNhbGxlZCBgJW1ldGhvZCVgIG9uIGFuIGluc3RhbmNlIG9mICVjb21wb25lbnQlLCB3aGljaCBpcyBubyBsb25nZXIgdmFsaWQgaW4gU3ZlbHRlIDUuIFNlZSBodHRwczovL3N2ZWx0ZS5kZXYvZG9jcy9zdmVsdGUvdjUtbWlncmF0aW9uLWd1aWRlI0NvbXBvbmVudHMtYXJlLW5vLWxvbmdlci1jbGFzc2VzIGZvciBtb3JlIGluZm9ybWF0aW9uXG4gKiBAcGFyYW0ge3N0cmluZ30gcGFyZW50XG4gKiBAcGFyYW0ge3N0cmluZ30gbWV0aG9kXG4gKiBAcGFyYW0ge3N0cmluZ30gY29tcG9uZW50XG4gKiBAcmV0dXJucyB7bmV2ZXJ9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb21wb25lbnRfYXBpX2NoYW5nZWQocGFyZW50LCBtZXRob2QsIGNvbXBvbmVudCkge1xuXHRpZiAoREVWKSB7XG5cdFx0Y29uc3QgZXJyb3IgPSBuZXcgRXJyb3IoYGNvbXBvbmVudF9hcGlfY2hhbmdlZFxcbiR7cGFyZW50fSBjYWxsZWQgXFxgJHttZXRob2R9XFxgIG9uIGFuIGluc3RhbmNlIG9mICR7Y29tcG9uZW50fSwgd2hpY2ggaXMgbm8gbG9uZ2VyIHZhbGlkIGluIFN2ZWx0ZSA1LiBTZWUgaHR0cHM6Ly9zdmVsdGUuZGV2L2RvY3Mvc3ZlbHRlL3Y1LW1pZ3JhdGlvbi1ndWlkZSNDb21wb25lbnRzLWFyZS1uby1sb25nZXItY2xhc3NlcyBmb3IgbW9yZSBpbmZvcm1hdGlvblxcbmh0dHBzOi8vc3ZlbHRlLmRldi9lL2NvbXBvbmVudF9hcGlfY2hhbmdlZGApO1xuXG5cdFx0ZXJyb3IubmFtZSA9ICdTdmVsdGUgZXJyb3InO1xuXHRcdHRocm93IGVycm9yO1xuXHR9IGVsc2Uge1xuXHRcdHRocm93IG5ldyBFcnJvcihgaHR0cHM6Ly9zdmVsdGUuZGV2L2UvY29tcG9uZW50X2FwaV9jaGFuZ2VkYCk7XG5cdH1cbn1cblxuLyoqXG4gKiBBdHRlbXB0ZWQgdG8gaW5zdGFudGlhdGUgJWNvbXBvbmVudCUgd2l0aCBgbmV3ICVuYW1lJWAsIHdoaWNoIGlzIG5vIGxvbmdlciB2YWxpZCBpbiBTdmVsdGUgNS4gSWYgdGhpcyBjb21wb25lbnQgaXMgbm90IHVuZGVyIHlvdXIgY29udHJvbCwgc2V0IHRoZSBgY29tcGF0aWJpbGl0eS5jb21wb25lbnRBcGlgIGNvbXBpbGVyIG9wdGlvbiB0byBgNGAgdG8ga2VlcCBpdCB3b3JraW5nLiBTZWUgaHR0cHM6Ly9zdmVsdGUuZGV2L2RvY3Mvc3ZlbHRlL3Y1LW1pZ3JhdGlvbi1ndWlkZSNDb21wb25lbnRzLWFyZS1uby1sb25nZXItY2xhc3NlcyBmb3IgbW9yZSBpbmZvcm1hdGlvblxuICogQHBhcmFtIHtzdHJpbmd9IGNvbXBvbmVudFxuICogQHBhcmFtIHtzdHJpbmd9IG5hbWVcbiAqIEByZXR1cm5zIHtuZXZlcn1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvbXBvbmVudF9hcGlfaW52YWxpZF9uZXcoY29tcG9uZW50LCBuYW1lKSB7XG5cdGlmIChERVYpIHtcblx0XHRjb25zdCBlcnJvciA9IG5ldyBFcnJvcihgY29tcG9uZW50X2FwaV9pbnZhbGlkX25ld1xcbkF0dGVtcHRlZCB0byBpbnN0YW50aWF0ZSAke2NvbXBvbmVudH0gd2l0aCBcXGBuZXcgJHtuYW1lfVxcYCwgd2hpY2ggaXMgbm8gbG9uZ2VyIHZhbGlkIGluIFN2ZWx0ZSA1LiBJZiB0aGlzIGNvbXBvbmVudCBpcyBub3QgdW5kZXIgeW91ciBjb250cm9sLCBzZXQgdGhlIFxcYGNvbXBhdGliaWxpdHkuY29tcG9uZW50QXBpXFxgIGNvbXBpbGVyIG9wdGlvbiB0byBcXGA0XFxgIHRvIGtlZXAgaXQgd29ya2luZy4gU2VlIGh0dHBzOi8vc3ZlbHRlLmRldi9kb2NzL3N2ZWx0ZS92NS1taWdyYXRpb24tZ3VpZGUjQ29tcG9uZW50cy1hcmUtbm8tbG9uZ2VyLWNsYXNzZXMgZm9yIG1vcmUgaW5mb3JtYXRpb25cXG5odHRwczovL3N2ZWx0ZS5kZXYvZS9jb21wb25lbnRfYXBpX2ludmFsaWRfbmV3YCk7XG5cblx0XHRlcnJvci5uYW1lID0gJ1N2ZWx0ZSBlcnJvcic7XG5cdFx0dGhyb3cgZXJyb3I7XG5cdH0gZWxzZSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKGBodHRwczovL3N2ZWx0ZS5kZXYvZS9jb21wb25lbnRfYXBpX2ludmFsaWRfbmV3YCk7XG5cdH1cbn1cblxuLyoqXG4gKiBBIGRlcml2ZWQgdmFsdWUgY2Fubm90IHJlZmVyZW5jZSBpdHNlbGYgcmVjdXJzaXZlbHlcbiAqIEByZXR1cm5zIHtuZXZlcn1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRlcml2ZWRfcmVmZXJlbmNlc19zZWxmKCkge1xuXHRpZiAoREVWKSB7XG5cdFx0Y29uc3QgZXJyb3IgPSBuZXcgRXJyb3IoYGRlcml2ZWRfcmVmZXJlbmNlc19zZWxmXFxuQSBkZXJpdmVkIHZhbHVlIGNhbm5vdCByZWZlcmVuY2UgaXRzZWxmIHJlY3Vyc2l2ZWx5XFxuaHR0cHM6Ly9zdmVsdGUuZGV2L2UvZGVyaXZlZF9yZWZlcmVuY2VzX3NlbGZgKTtcblxuXHRcdGVycm9yLm5hbWUgPSAnU3ZlbHRlIGVycm9yJztcblx0XHR0aHJvdyBlcnJvcjtcblx0fSBlbHNlIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoYGh0dHBzOi8vc3ZlbHRlLmRldi9lL2Rlcml2ZWRfcmVmZXJlbmNlc19zZWxmYCk7XG5cdH1cbn1cblxuLyoqXG4gKiBLZXllZCBlYWNoIGJsb2NrIGhhcyBkdXBsaWNhdGUga2V5IGAldmFsdWUlYCBhdCBpbmRleGVzICVhJSBhbmQgJWIlXG4gKiBAcGFyYW0ge3N0cmluZ30gYVxuICogQHBhcmFtIHtzdHJpbmd9IGJcbiAqIEBwYXJhbSB7c3RyaW5nIHwgdW5kZWZpbmVkIHwgbnVsbH0gW3ZhbHVlXVxuICogQHJldHVybnMge25ldmVyfVxuICovXG5leHBvcnQgZnVuY3Rpb24gZWFjaF9rZXlfZHVwbGljYXRlKGEsIGIsIHZhbHVlKSB7XG5cdGlmIChERVYpIHtcblx0XHRjb25zdCBlcnJvciA9IG5ldyBFcnJvcihgZWFjaF9rZXlfZHVwbGljYXRlXFxuJHt2YWx1ZSA/IGBLZXllZCBlYWNoIGJsb2NrIGhhcyBkdXBsaWNhdGUga2V5IFxcYCR7dmFsdWV9XFxgIGF0IGluZGV4ZXMgJHthfSBhbmQgJHtifWAgOiBgS2V5ZWQgZWFjaCBibG9jayBoYXMgZHVwbGljYXRlIGtleSBhdCBpbmRleGVzICR7YX0gYW5kICR7Yn1gfVxcbmh0dHBzOi8vc3ZlbHRlLmRldi9lL2VhY2hfa2V5X2R1cGxpY2F0ZWApO1xuXG5cdFx0ZXJyb3IubmFtZSA9ICdTdmVsdGUgZXJyb3InO1xuXHRcdHRocm93IGVycm9yO1xuXHR9IGVsc2Uge1xuXHRcdHRocm93IG5ldyBFcnJvcihgaHR0cHM6Ly9zdmVsdGUuZGV2L2UvZWFjaF9rZXlfZHVwbGljYXRlYCk7XG5cdH1cbn1cblxuLyoqXG4gKiBgJXJ1bmUlYCBjYW5ub3QgYmUgdXNlZCBpbnNpZGUgYW4gZWZmZWN0IGNsZWFudXAgZnVuY3Rpb25cbiAqIEBwYXJhbSB7c3RyaW5nfSBydW5lXG4gKiBAcmV0dXJucyB7bmV2ZXJ9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBlZmZlY3RfaW5fdGVhcmRvd24ocnVuZSkge1xuXHRpZiAoREVWKSB7XG5cdFx0Y29uc3QgZXJyb3IgPSBuZXcgRXJyb3IoYGVmZmVjdF9pbl90ZWFyZG93blxcblxcYCR7cnVuZX1cXGAgY2Fubm90IGJlIHVzZWQgaW5zaWRlIGFuIGVmZmVjdCBjbGVhbnVwIGZ1bmN0aW9uXFxuaHR0cHM6Ly9zdmVsdGUuZGV2L2UvZWZmZWN0X2luX3RlYXJkb3duYCk7XG5cblx0XHRlcnJvci5uYW1lID0gJ1N2ZWx0ZSBlcnJvcic7XG5cdFx0dGhyb3cgZXJyb3I7XG5cdH0gZWxzZSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKGBodHRwczovL3N2ZWx0ZS5kZXYvZS9lZmZlY3RfaW5fdGVhcmRvd25gKTtcblx0fVxufVxuXG4vKipcbiAqIEVmZmVjdCBjYW5ub3QgYmUgY3JlYXRlZCBpbnNpZGUgYSBgJGRlcml2ZWRgIHZhbHVlIHRoYXQgd2FzIG5vdCBpdHNlbGYgY3JlYXRlZCBpbnNpZGUgYW4gZWZmZWN0XG4gKiBAcmV0dXJucyB7bmV2ZXJ9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBlZmZlY3RfaW5fdW5vd25lZF9kZXJpdmVkKCkge1xuXHRpZiAoREVWKSB7XG5cdFx0Y29uc3QgZXJyb3IgPSBuZXcgRXJyb3IoYGVmZmVjdF9pbl91bm93bmVkX2Rlcml2ZWRcXG5FZmZlY3QgY2Fubm90IGJlIGNyZWF0ZWQgaW5zaWRlIGEgXFxgJGRlcml2ZWRcXGAgdmFsdWUgdGhhdCB3YXMgbm90IGl0c2VsZiBjcmVhdGVkIGluc2lkZSBhbiBlZmZlY3RcXG5odHRwczovL3N2ZWx0ZS5kZXYvZS9lZmZlY3RfaW5fdW5vd25lZF9kZXJpdmVkYCk7XG5cblx0XHRlcnJvci5uYW1lID0gJ1N2ZWx0ZSBlcnJvcic7XG5cdFx0dGhyb3cgZXJyb3I7XG5cdH0gZWxzZSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKGBodHRwczovL3N2ZWx0ZS5kZXYvZS9lZmZlY3RfaW5fdW5vd25lZF9kZXJpdmVkYCk7XG5cdH1cbn1cblxuLyoqXG4gKiBgJXJ1bmUlYCBjYW4gb25seSBiZSB1c2VkIGluc2lkZSBhbiBlZmZlY3QgKGUuZy4gZHVyaW5nIGNvbXBvbmVudCBpbml0aWFsaXNhdGlvbilcbiAqIEBwYXJhbSB7c3RyaW5nfSBydW5lXG4gKiBAcmV0dXJucyB7bmV2ZXJ9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBlZmZlY3Rfb3JwaGFuKHJ1bmUpIHtcblx0aWYgKERFVikge1xuXHRcdGNvbnN0IGVycm9yID0gbmV3IEVycm9yKGBlZmZlY3Rfb3JwaGFuXFxuXFxgJHtydW5lfVxcYCBjYW4gb25seSBiZSB1c2VkIGluc2lkZSBhbiBlZmZlY3QgKGUuZy4gZHVyaW5nIGNvbXBvbmVudCBpbml0aWFsaXNhdGlvbilcXG5odHRwczovL3N2ZWx0ZS5kZXYvZS9lZmZlY3Rfb3JwaGFuYCk7XG5cblx0XHRlcnJvci5uYW1lID0gJ1N2ZWx0ZSBlcnJvcic7XG5cdFx0dGhyb3cgZXJyb3I7XG5cdH0gZWxzZSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKGBodHRwczovL3N2ZWx0ZS5kZXYvZS9lZmZlY3Rfb3JwaGFuYCk7XG5cdH1cbn1cblxuLyoqXG4gKiBNYXhpbXVtIHVwZGF0ZSBkZXB0aCBleGNlZWRlZC4gVGhpcyBjYW4gaGFwcGVuIHdoZW4gYSByZWFjdGl2ZSBibG9jayBvciBlZmZlY3QgcmVwZWF0ZWRseSBzZXRzIGEgbmV3IHZhbHVlLiBTdmVsdGUgbGltaXRzIHRoZSBudW1iZXIgb2YgbmVzdGVkIHVwZGF0ZXMgdG8gcHJldmVudCBpbmZpbml0ZSBsb29wc1xuICogQHJldHVybnMge25ldmVyfVxuICovXG5leHBvcnQgZnVuY3Rpb24gZWZmZWN0X3VwZGF0ZV9kZXB0aF9leGNlZWRlZCgpIHtcblx0aWYgKERFVikge1xuXHRcdGNvbnN0IGVycm9yID0gbmV3IEVycm9yKGBlZmZlY3RfdXBkYXRlX2RlcHRoX2V4Y2VlZGVkXFxuTWF4aW11bSB1cGRhdGUgZGVwdGggZXhjZWVkZWQuIFRoaXMgY2FuIGhhcHBlbiB3aGVuIGEgcmVhY3RpdmUgYmxvY2sgb3IgZWZmZWN0IHJlcGVhdGVkbHkgc2V0cyBhIG5ldyB2YWx1ZS4gU3ZlbHRlIGxpbWl0cyB0aGUgbnVtYmVyIG9mIG5lc3RlZCB1cGRhdGVzIHRvIHByZXZlbnQgaW5maW5pdGUgbG9vcHNcXG5odHRwczovL3N2ZWx0ZS5kZXYvZS9lZmZlY3RfdXBkYXRlX2RlcHRoX2V4Y2VlZGVkYCk7XG5cblx0XHRlcnJvci5uYW1lID0gJ1N2ZWx0ZSBlcnJvcic7XG5cdFx0dGhyb3cgZXJyb3I7XG5cdH0gZWxzZSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKGBodHRwczovL3N2ZWx0ZS5kZXYvZS9lZmZlY3RfdXBkYXRlX2RlcHRoX2V4Y2VlZGVkYCk7XG5cdH1cbn1cblxuLyoqXG4gKiBGYWlsZWQgdG8gaHlkcmF0ZSB0aGUgYXBwbGljYXRpb25cbiAqIEByZXR1cm5zIHtuZXZlcn1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGh5ZHJhdGlvbl9mYWlsZWQoKSB7XG5cdGlmIChERVYpIHtcblx0XHRjb25zdCBlcnJvciA9IG5ldyBFcnJvcihgaHlkcmF0aW9uX2ZhaWxlZFxcbkZhaWxlZCB0byBoeWRyYXRlIHRoZSBhcHBsaWNhdGlvblxcbmh0dHBzOi8vc3ZlbHRlLmRldi9lL2h5ZHJhdGlvbl9mYWlsZWRgKTtcblxuXHRcdGVycm9yLm5hbWUgPSAnU3ZlbHRlIGVycm9yJztcblx0XHR0aHJvdyBlcnJvcjtcblx0fSBlbHNlIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoYGh0dHBzOi8vc3ZlbHRlLmRldi9lL2h5ZHJhdGlvbl9mYWlsZWRgKTtcblx0fVxufVxuXG4vKipcbiAqIENvdWxkIG5vdCBge0ByZW5kZXJ9YCBzbmlwcGV0IGR1ZSB0byB0aGUgZXhwcmVzc2lvbiBiZWluZyBgbnVsbGAgb3IgYHVuZGVmaW5lZGAuIENvbnNpZGVyIHVzaW5nIG9wdGlvbmFsIGNoYWluaW5nIGB7QHJlbmRlciBzbmlwcGV0Py4oKX1gXG4gKiBAcmV0dXJucyB7bmV2ZXJ9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpbnZhbGlkX3NuaXBwZXQoKSB7XG5cdGlmIChERVYpIHtcblx0XHRjb25zdCBlcnJvciA9IG5ldyBFcnJvcihgaW52YWxpZF9zbmlwcGV0XFxuQ291bGQgbm90IFxcYHtAcmVuZGVyfVxcYCBzbmlwcGV0IGR1ZSB0byB0aGUgZXhwcmVzc2lvbiBiZWluZyBcXGBudWxsXFxgIG9yIFxcYHVuZGVmaW5lZFxcYC4gQ29uc2lkZXIgdXNpbmcgb3B0aW9uYWwgY2hhaW5pbmcgXFxge0ByZW5kZXIgc25pcHBldD8uKCl9XFxgXFxuaHR0cHM6Ly9zdmVsdGUuZGV2L2UvaW52YWxpZF9zbmlwcGV0YCk7XG5cblx0XHRlcnJvci5uYW1lID0gJ1N2ZWx0ZSBlcnJvcic7XG5cdFx0dGhyb3cgZXJyb3I7XG5cdH0gZWxzZSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKGBodHRwczovL3N2ZWx0ZS5kZXYvZS9pbnZhbGlkX3NuaXBwZXRgKTtcblx0fVxufVxuXG4vKipcbiAqIGAlbmFtZSUoLi4uKWAgY2Fubm90IGJlIHVzZWQgaW4gcnVuZXMgbW9kZVxuICogQHBhcmFtIHtzdHJpbmd9IG5hbWVcbiAqIEByZXR1cm5zIHtuZXZlcn1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxpZmVjeWNsZV9sZWdhY3lfb25seShuYW1lKSB7XG5cdGlmIChERVYpIHtcblx0XHRjb25zdCBlcnJvciA9IG5ldyBFcnJvcihgbGlmZWN5Y2xlX2xlZ2FjeV9vbmx5XFxuXFxgJHtuYW1lfSguLi4pXFxgIGNhbm5vdCBiZSB1c2VkIGluIHJ1bmVzIG1vZGVcXG5odHRwczovL3N2ZWx0ZS5kZXYvZS9saWZlY3ljbGVfbGVnYWN5X29ubHlgKTtcblxuXHRcdGVycm9yLm5hbWUgPSAnU3ZlbHRlIGVycm9yJztcblx0XHR0aHJvdyBlcnJvcjtcblx0fSBlbHNlIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoYGh0dHBzOi8vc3ZlbHRlLmRldi9lL2xpZmVjeWNsZV9sZWdhY3lfb25seWApO1xuXHR9XG59XG5cbi8qKlxuICogQ2Fubm90IGRvIGBiaW5kOiVrZXklPXt1bmRlZmluZWR9YCB3aGVuIGAla2V5JWAgaGFzIGEgZmFsbGJhY2sgdmFsdWVcbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXlcbiAqIEByZXR1cm5zIHtuZXZlcn1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHByb3BzX2ludmFsaWRfdmFsdWUoa2V5KSB7XG5cdGlmIChERVYpIHtcblx0XHRjb25zdCBlcnJvciA9IG5ldyBFcnJvcihgcHJvcHNfaW52YWxpZF92YWx1ZVxcbkNhbm5vdCBkbyBcXGBiaW5kOiR7a2V5fT17dW5kZWZpbmVkfVxcYCB3aGVuIFxcYCR7a2V5fVxcYCBoYXMgYSBmYWxsYmFjayB2YWx1ZVxcbmh0dHBzOi8vc3ZlbHRlLmRldi9lL3Byb3BzX2ludmFsaWRfdmFsdWVgKTtcblxuXHRcdGVycm9yLm5hbWUgPSAnU3ZlbHRlIGVycm9yJztcblx0XHR0aHJvdyBlcnJvcjtcblx0fSBlbHNlIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoYGh0dHBzOi8vc3ZlbHRlLmRldi9lL3Byb3BzX2ludmFsaWRfdmFsdWVgKTtcblx0fVxufVxuXG4vKipcbiAqIFJlc3QgZWxlbWVudCBwcm9wZXJ0aWVzIG9mIGAkcHJvcHMoKWAgc3VjaCBhcyBgJXByb3BlcnR5JWAgYXJlIHJlYWRvbmx5XG4gKiBAcGFyYW0ge3N0cmluZ30gcHJvcGVydHlcbiAqIEByZXR1cm5zIHtuZXZlcn1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHByb3BzX3Jlc3RfcmVhZG9ubHkocHJvcGVydHkpIHtcblx0aWYgKERFVikge1xuXHRcdGNvbnN0IGVycm9yID0gbmV3IEVycm9yKGBwcm9wc19yZXN0X3JlYWRvbmx5XFxuUmVzdCBlbGVtZW50IHByb3BlcnRpZXMgb2YgXFxgJHByb3BzKClcXGAgc3VjaCBhcyBcXGAke3Byb3BlcnR5fVxcYCBhcmUgcmVhZG9ubHlcXG5odHRwczovL3N2ZWx0ZS5kZXYvZS9wcm9wc19yZXN0X3JlYWRvbmx5YCk7XG5cblx0XHRlcnJvci5uYW1lID0gJ1N2ZWx0ZSBlcnJvcic7XG5cdFx0dGhyb3cgZXJyb3I7XG5cdH0gZWxzZSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKGBodHRwczovL3N2ZWx0ZS5kZXYvZS9wcm9wc19yZXN0X3JlYWRvbmx5YCk7XG5cdH1cbn1cblxuLyoqXG4gKiBUaGUgYCVydW5lJWAgcnVuZSBpcyBvbmx5IGF2YWlsYWJsZSBpbnNpZGUgYC5zdmVsdGVgIGFuZCBgLnN2ZWx0ZS5qcy90c2AgZmlsZXNcbiAqIEBwYXJhbSB7c3RyaW5nfSBydW5lXG4gKiBAcmV0dXJucyB7bmV2ZXJ9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBydW5lX291dHNpZGVfc3ZlbHRlKHJ1bmUpIHtcblx0aWYgKERFVikge1xuXHRcdGNvbnN0IGVycm9yID0gbmV3IEVycm9yKGBydW5lX291dHNpZGVfc3ZlbHRlXFxuVGhlIFxcYCR7cnVuZX1cXGAgcnVuZSBpcyBvbmx5IGF2YWlsYWJsZSBpbnNpZGUgXFxgLnN2ZWx0ZVxcYCBhbmQgXFxgLnN2ZWx0ZS5qcy90c1xcYCBmaWxlc1xcbmh0dHBzOi8vc3ZlbHRlLmRldi9lL3J1bmVfb3V0c2lkZV9zdmVsdGVgKTtcblxuXHRcdGVycm9yLm5hbWUgPSAnU3ZlbHRlIGVycm9yJztcblx0XHR0aHJvdyBlcnJvcjtcblx0fSBlbHNlIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoYGh0dHBzOi8vc3ZlbHRlLmRldi9lL3J1bmVfb3V0c2lkZV9zdmVsdGVgKTtcblx0fVxufVxuXG4vKipcbiAqIFByb3BlcnR5IGRlc2NyaXB0b3JzIGRlZmluZWQgb24gYCRzdGF0ZWAgb2JqZWN0cyBtdXN0IGNvbnRhaW4gYHZhbHVlYCBhbmQgYWx3YXlzIGJlIGBlbnVtZXJhYmxlYCwgYGNvbmZpZ3VyYWJsZWAgYW5kIGB3cml0YWJsZWAuXG4gKiBAcmV0dXJucyB7bmV2ZXJ9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzdGF0ZV9kZXNjcmlwdG9yc19maXhlZCgpIHtcblx0aWYgKERFVikge1xuXHRcdGNvbnN0IGVycm9yID0gbmV3IEVycm9yKGBzdGF0ZV9kZXNjcmlwdG9yc19maXhlZFxcblByb3BlcnR5IGRlc2NyaXB0b3JzIGRlZmluZWQgb24gXFxgJHN0YXRlXFxgIG9iamVjdHMgbXVzdCBjb250YWluIFxcYHZhbHVlXFxgIGFuZCBhbHdheXMgYmUgXFxgZW51bWVyYWJsZVxcYCwgXFxgY29uZmlndXJhYmxlXFxgIGFuZCBcXGB3cml0YWJsZVxcYC5cXG5odHRwczovL3N2ZWx0ZS5kZXYvZS9zdGF0ZV9kZXNjcmlwdG9yc19maXhlZGApO1xuXG5cdFx0ZXJyb3IubmFtZSA9ICdTdmVsdGUgZXJyb3InO1xuXHRcdHRocm93IGVycm9yO1xuXHR9IGVsc2Uge1xuXHRcdHRocm93IG5ldyBFcnJvcihgaHR0cHM6Ly9zdmVsdGUuZGV2L2Uvc3RhdGVfZGVzY3JpcHRvcnNfZml4ZWRgKTtcblx0fVxufVxuXG4vKipcbiAqIENhbm5vdCBzZXQgcHJvdG90eXBlIG9mIGAkc3RhdGVgIG9iamVjdFxuICogQHJldHVybnMge25ldmVyfVxuICovXG5leHBvcnQgZnVuY3Rpb24gc3RhdGVfcHJvdG90eXBlX2ZpeGVkKCkge1xuXHRpZiAoREVWKSB7XG5cdFx0Y29uc3QgZXJyb3IgPSBuZXcgRXJyb3IoYHN0YXRlX3Byb3RvdHlwZV9maXhlZFxcbkNhbm5vdCBzZXQgcHJvdG90eXBlIG9mIFxcYCRzdGF0ZVxcYCBvYmplY3RcXG5odHRwczovL3N2ZWx0ZS5kZXYvZS9zdGF0ZV9wcm90b3R5cGVfZml4ZWRgKTtcblxuXHRcdGVycm9yLm5hbWUgPSAnU3ZlbHRlIGVycm9yJztcblx0XHR0aHJvdyBlcnJvcjtcblx0fSBlbHNlIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoYGh0dHBzOi8vc3ZlbHRlLmRldi9lL3N0YXRlX3Byb3RvdHlwZV9maXhlZGApO1xuXHR9XG59XG5cbi8qKlxuICogUmVhZGluZyBzdGF0ZSB0aGF0IHdhcyBjcmVhdGVkIGluc2lkZSB0aGUgc2FtZSBkZXJpdmVkIGlzIGZvcmJpZGRlbi4gQ29uc2lkZXIgdXNpbmcgYHVudHJhY2tgIHRvIHJlYWQgbG9jYWxseSBjcmVhdGVkIHN0YXRlXG4gKiBAcmV0dXJucyB7bmV2ZXJ9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzdGF0ZV91bnNhZmVfbG9jYWxfcmVhZCgpIHtcblx0aWYgKERFVikge1xuXHRcdGNvbnN0IGVycm9yID0gbmV3IEVycm9yKGBzdGF0ZV91bnNhZmVfbG9jYWxfcmVhZFxcblJlYWRpbmcgc3RhdGUgdGhhdCB3YXMgY3JlYXRlZCBpbnNpZGUgdGhlIHNhbWUgZGVyaXZlZCBpcyBmb3JiaWRkZW4uIENvbnNpZGVyIHVzaW5nIFxcYHVudHJhY2tcXGAgdG8gcmVhZCBsb2NhbGx5IGNyZWF0ZWQgc3RhdGVcXG5odHRwczovL3N2ZWx0ZS5kZXYvZS9zdGF0ZV91bnNhZmVfbG9jYWxfcmVhZGApO1xuXG5cdFx0ZXJyb3IubmFtZSA9ICdTdmVsdGUgZXJyb3InO1xuXHRcdHRocm93IGVycm9yO1xuXHR9IGVsc2Uge1xuXHRcdHRocm93IG5ldyBFcnJvcihgaHR0cHM6Ly9zdmVsdGUuZGV2L2Uvc3RhdGVfdW5zYWZlX2xvY2FsX3JlYWRgKTtcblx0fVxufVxuXG4vKipcbiAqIFVwZGF0aW5nIHN0YXRlIGluc2lkZSBhIGRlcml2ZWQgb3IgYSB0ZW1wbGF0ZSBleHByZXNzaW9uIGlzIGZvcmJpZGRlbi4gSWYgdGhlIHZhbHVlIHNob3VsZCBub3QgYmUgcmVhY3RpdmUsIGRlY2xhcmUgaXQgd2l0aG91dCBgJHN0YXRlYFxuICogQHJldHVybnMge25ldmVyfVxuICovXG5leHBvcnQgZnVuY3Rpb24gc3RhdGVfdW5zYWZlX211dGF0aW9uKCkge1xuXHRpZiAoREVWKSB7XG5cdFx0Y29uc3QgZXJyb3IgPSBuZXcgRXJyb3IoYHN0YXRlX3Vuc2FmZV9tdXRhdGlvblxcblVwZGF0aW5nIHN0YXRlIGluc2lkZSBhIGRlcml2ZWQgb3IgYSB0ZW1wbGF0ZSBleHByZXNzaW9uIGlzIGZvcmJpZGRlbi4gSWYgdGhlIHZhbHVlIHNob3VsZCBub3QgYmUgcmVhY3RpdmUsIGRlY2xhcmUgaXQgd2l0aG91dCBcXGAkc3RhdGVcXGBcXG5odHRwczovL3N2ZWx0ZS5kZXYvZS9zdGF0ZV91bnNhZmVfbXV0YXRpb25gKTtcblxuXHRcdGVycm9yLm5hbWUgPSAnU3ZlbHRlIGVycm9yJztcblx0XHR0aHJvdyBlcnJvcjtcblx0fSBlbHNlIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoYGh0dHBzOi8vc3ZlbHRlLmRldi9lL3N0YXRlX3Vuc2FmZV9tdXRhdGlvbmApO1xuXHR9XG59IiwiZXhwb3J0IGxldCBsZWdhY3lfbW9kZV9mbGFnID0gZmFsc2U7XG5leHBvcnQgbGV0IHRyYWNpbmdfbW9kZV9mbGFnID0gZmFsc2U7XG5cbmV4cG9ydCBmdW5jdGlvbiBlbmFibGVfbGVnYWN5X21vZGVfZmxhZygpIHtcblx0bGVnYWN5X21vZGVfZmxhZyA9IHRydWU7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBlbmFibGVfdHJhY2luZ19tb2RlX2ZsYWcoKSB7XG5cdHRyYWNpbmdfbW9kZV9mbGFnID0gdHJ1ZTtcbn1cbiIsIi8qKiBAaW1wb3J0IHsgRGVyaXZlZCwgRWZmZWN0LCBSZWFjdGlvbiwgU291cmNlLCBWYWx1ZSB9IGZyb20gJyNjbGllbnQnICovXG5pbXBvcnQgeyBERVYgfSBmcm9tICdlc20tZW52JztcbmltcG9ydCB7XG5cdGNvbXBvbmVudF9jb250ZXh0LFxuXHRhY3RpdmVfcmVhY3Rpb24sXG5cdG5ld19kZXBzLFxuXHRhY3RpdmVfZWZmZWN0LFxuXHR1bnRyYWNrZWRfd3JpdGVzLFxuXHRnZXQsXG5cdGlzX3J1bmVzLFxuXHRzY2hlZHVsZV9lZmZlY3QsXG5cdHNldF91bnRyYWNrZWRfd3JpdGVzLFxuXHRzZXRfc2lnbmFsX3N0YXR1cyxcblx0dW50cmFjayxcblx0aW5jcmVtZW50X3ZlcnNpb24sXG5cdHVwZGF0ZV9lZmZlY3QsXG5cdGRlcml2ZWRfc291cmNlcyxcblx0c2V0X2Rlcml2ZWRfc291cmNlcyxcblx0Y2hlY2tfZGlydGluZXNzLFxuXHRzZXRfaXNfZmx1c2hpbmdfZWZmZWN0LFxuXHRpc19mbHVzaGluZ19lZmZlY3Rcbn0gZnJvbSAnLi4vcnVudGltZS5qcyc7XG5pbXBvcnQgeyBlcXVhbHMsIHNhZmVfZXF1YWxzIH0gZnJvbSAnLi9lcXVhbGl0eS5qcyc7XG5pbXBvcnQge1xuXHRDTEVBTixcblx0REVSSVZFRCxcblx0RElSVFksXG5cdEJSQU5DSF9FRkZFQ1QsXG5cdElOU1BFQ1RfRUZGRUNULFxuXHRVTk9XTkVELFxuXHRNQVlCRV9ESVJUWSxcblx0QkxPQ0tfRUZGRUNUXG59IGZyb20gJy4uL2NvbnN0YW50cy5qcyc7XG5pbXBvcnQgKiBhcyBlIGZyb20gJy4uL2Vycm9ycy5qcyc7XG5pbXBvcnQgeyBsZWdhY3lfbW9kZV9mbGFnLCB0cmFjaW5nX21vZGVfZmxhZyB9IGZyb20gJy4uLy4uL2ZsYWdzL2luZGV4LmpzJztcbmltcG9ydCB7IGdldF9zdGFjayB9IGZyb20gJy4uL2Rldi90cmFjaW5nLmpzJztcblxuZXhwb3J0IGxldCBpbnNwZWN0X2VmZmVjdHMgPSBuZXcgU2V0KCk7XG5cbi8qKlxuICogQHBhcmFtIHtTZXQ8YW55Pn0gdlxuICovXG5leHBvcnQgZnVuY3Rpb24gc2V0X2luc3BlY3RfZWZmZWN0cyh2KSB7XG5cdGluc3BlY3RfZWZmZWN0cyA9IHY7XG59XG5cbi8qKlxuICogQHRlbXBsYXRlIFZcbiAqIEBwYXJhbSB7Vn0gdlxuICogQHBhcmFtIHtFcnJvciB8IG51bGx9IFtzdGFja11cbiAqIEByZXR1cm5zIHtTb3VyY2U8Vj59XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzb3VyY2Uodiwgc3RhY2spIHtcblx0LyoqIEB0eXBlIHtWYWx1ZX0gKi9cblx0dmFyIHNpZ25hbCA9IHtcblx0XHRmOiAwLCAvLyBUT0RPIGlkZWFsbHkgd2UgY291bGQgc2tpcCB0aGlzIGFsdG9nZXRoZXIsIGJ1dCBpdCBjYXVzZXMgdHlwZSBlcnJvcnNcblx0XHR2LFxuXHRcdHJlYWN0aW9uczogbnVsbCxcblx0XHRlcXVhbHMsXG5cdFx0dmVyc2lvbjogMFxuXHR9O1xuXG5cdGlmIChERVYgJiYgdHJhY2luZ19tb2RlX2ZsYWcpIHtcblx0XHRzaWduYWwuY3JlYXRlZCA9IHN0YWNrID8/IGdldF9zdGFjaygnQ3JlYXRlZEF0Jyk7XG5cdFx0c2lnbmFsLmRlYnVnID0gbnVsbDtcblx0fVxuXG5cdHJldHVybiBzaWduYWw7XG59XG5cbi8qKlxuICogQHRlbXBsYXRlIFZcbiAqIEBwYXJhbSB7Vn0gdlxuICovXG5leHBvcnQgZnVuY3Rpb24gc3RhdGUodikge1xuXHRyZXR1cm4gcHVzaF9kZXJpdmVkX3NvdXJjZShzb3VyY2UodikpO1xufVxuXG4vKipcbiAqIEB0ZW1wbGF0ZSBWXG4gKiBAcGFyYW0ge1Z9IGluaXRpYWxfdmFsdWVcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gW2ltbXV0YWJsZV1cbiAqIEByZXR1cm5zIHtTb3VyY2U8Vj59XG4gKi9cbi8qI19fTk9fU0lERV9FRkZFQ1RTX18qL1xuZXhwb3J0IGZ1bmN0aW9uIG11dGFibGVfc291cmNlKGluaXRpYWxfdmFsdWUsIGltbXV0YWJsZSA9IGZhbHNlKSB7XG5cdGNvbnN0IHMgPSBzb3VyY2UoaW5pdGlhbF92YWx1ZSk7XG5cdGlmICghaW1tdXRhYmxlKSB7XG5cdFx0cy5lcXVhbHMgPSBzYWZlX2VxdWFscztcblx0fVxuXG5cdC8vIGJpbmQgdGhlIHNpZ25hbCB0byB0aGUgY29tcG9uZW50IGNvbnRleHQsIGluIGNhc2Ugd2UgbmVlZCB0b1xuXHQvLyB0cmFjayB1cGRhdGVzIHRvIHRyaWdnZXIgYmVmb3JlVXBkYXRlL2FmdGVyVXBkYXRlIGNhbGxiYWNrc1xuXHRpZiAobGVnYWN5X21vZGVfZmxhZyAmJiBjb21wb25lbnRfY29udGV4dCAhPT0gbnVsbCAmJiBjb21wb25lbnRfY29udGV4dC5sICE9PSBudWxsKSB7XG5cdFx0KGNvbXBvbmVudF9jb250ZXh0LmwucyA/Pz0gW10pLnB1c2gocyk7XG5cdH1cblxuXHRyZXR1cm4gcztcbn1cblxuLyoqXG4gKiBAdGVtcGxhdGUgVlxuICogQHBhcmFtIHtWfSB2XG4gKiBAcGFyYW0ge2Jvb2xlYW59IFtpbW11dGFibGVdXG4gKiBAcmV0dXJucyB7U291cmNlPFY+fVxuICovXG5leHBvcnQgZnVuY3Rpb24gbXV0YWJsZV9zdGF0ZSh2LCBpbW11dGFibGUgPSBmYWxzZSkge1xuXHRyZXR1cm4gcHVzaF9kZXJpdmVkX3NvdXJjZShtdXRhYmxlX3NvdXJjZSh2LCBpbW11dGFibGUpKTtcbn1cblxuLyoqXG4gKiBAdGVtcGxhdGUgVlxuICogQHBhcmFtIHtTb3VyY2U8Vj59IHNvdXJjZVxuICovXG4vKiNfX05PX1NJREVfRUZGRUNUU19fKi9cbmZ1bmN0aW9uIHB1c2hfZGVyaXZlZF9zb3VyY2Uoc291cmNlKSB7XG5cdGlmIChhY3RpdmVfcmVhY3Rpb24gIT09IG51bGwgJiYgKGFjdGl2ZV9yZWFjdGlvbi5mICYgREVSSVZFRCkgIT09IDApIHtcblx0XHRpZiAoZGVyaXZlZF9zb3VyY2VzID09PSBudWxsKSB7XG5cdFx0XHRzZXRfZGVyaXZlZF9zb3VyY2VzKFtzb3VyY2VdKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0ZGVyaXZlZF9zb3VyY2VzLnB1c2goc291cmNlKTtcblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gc291cmNlO1xufVxuXG4vKipcbiAqIEB0ZW1wbGF0ZSBWXG4gKiBAcGFyYW0ge1ZhbHVlPFY+fSBzb3VyY2VcbiAqIEBwYXJhbSB7Vn0gdmFsdWVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG11dGF0ZShzb3VyY2UsIHZhbHVlKSB7XG5cdHNldChcblx0XHRzb3VyY2UsXG5cdFx0dW50cmFjaygoKSA9PiBnZXQoc291cmNlKSlcblx0KTtcblx0cmV0dXJuIHZhbHVlO1xufVxuXG4vKipcbiAqIEB0ZW1wbGF0ZSBWXG4gKiBAcGFyYW0ge1NvdXJjZTxWPn0gc291cmNlXG4gKiBAcGFyYW0ge1Z9IHZhbHVlXG4gKiBAcmV0dXJucyB7Vn1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNldChzb3VyY2UsIHZhbHVlKSB7XG5cdGlmIChcblx0XHRhY3RpdmVfcmVhY3Rpb24gIT09IG51bGwgJiZcblx0XHRpc19ydW5lcygpICYmXG5cdFx0KGFjdGl2ZV9yZWFjdGlvbi5mICYgKERFUklWRUQgfCBCTE9DS19FRkZFQ1QpKSAhPT0gMCAmJlxuXHRcdC8vIElmIHRoZSBzb3VyY2Ugd2FzIGNyZWF0ZWQgbG9jYWxseSB3aXRoaW4gdGhlIGN1cnJlbnQgZGVyaXZlZCwgdGhlblxuXHRcdC8vIHdlIGFsbG93IHRoZSBtdXRhdGlvbi5cblx0XHQoZGVyaXZlZF9zb3VyY2VzID09PSBudWxsIHx8ICFkZXJpdmVkX3NvdXJjZXMuaW5jbHVkZXMoc291cmNlKSlcblx0KSB7XG5cdFx0ZS5zdGF0ZV91bnNhZmVfbXV0YXRpb24oKTtcblx0fVxuXG5cdHJldHVybiBpbnRlcm5hbF9zZXQoc291cmNlLCB2YWx1ZSk7XG59XG5cbi8qKlxuICogQHRlbXBsYXRlIFZcbiAqIEBwYXJhbSB7U291cmNlPFY+fSBzb3VyY2VcbiAqIEBwYXJhbSB7Vn0gdmFsdWVcbiAqIEByZXR1cm5zIHtWfVxuICovXG5leHBvcnQgZnVuY3Rpb24gaW50ZXJuYWxfc2V0KHNvdXJjZSwgdmFsdWUpIHtcblx0aWYgKCFzb3VyY2UuZXF1YWxzKHZhbHVlKSkge1xuXHRcdHNvdXJjZS52ID0gdmFsdWU7XG5cdFx0c291cmNlLnZlcnNpb24gPSBpbmNyZW1lbnRfdmVyc2lvbigpO1xuXG5cdFx0aWYgKERFViAmJiB0cmFjaW5nX21vZGVfZmxhZykge1xuXHRcdFx0c291cmNlLnVwZGF0ZWQgPSBnZXRfc3RhY2soJ1VwZGF0ZWRBdCcpO1xuXHRcdH1cblxuXHRcdG1hcmtfcmVhY3Rpb25zKHNvdXJjZSwgRElSVFkpO1xuXG5cdFx0Ly8gSWYgdGhlIGN1cnJlbnQgc2lnbmFsIGlzIHJ1bm5pbmcgZm9yIHRoZSBmaXJzdCB0aW1lLCBpdCB3b24ndCBoYXZlIGFueVxuXHRcdC8vIHJlYWN0aW9ucyBhcyB3ZSBvbmx5IGFsbG9jYXRlIGFuZCBhc3NpZ24gdGhlIHJlYWN0aW9ucyBhZnRlciB0aGUgc2lnbmFsXG5cdFx0Ly8gaGFzIGZ1bGx5IGV4ZWN1dGVkLiBTbyBpbiB0aGUgY2FzZSBvZiBlbnN1cmluZyBpdCByZWdpc3RlcnMgdGhlIHJlYWN0aW9uXG5cdFx0Ly8gcHJvcGVybHkgZm9yIGl0c2VsZiwgd2UgbmVlZCB0byBlbnN1cmUgdGhlIGN1cnJlbnQgZWZmZWN0IGFjdHVhbGx5IGdldHNcblx0XHQvLyBzY2hlZHVsZWQuIGkuZTogYCRlZmZlY3QoKCkgPT4geCsrKWBcblx0XHRpZiAoXG5cdFx0XHRpc19ydW5lcygpICYmXG5cdFx0XHRhY3RpdmVfZWZmZWN0ICE9PSBudWxsICYmXG5cdFx0XHQoYWN0aXZlX2VmZmVjdC5mICYgQ0xFQU4pICE9PSAwICYmXG5cdFx0XHQoYWN0aXZlX2VmZmVjdC5mICYgQlJBTkNIX0VGRkVDVCkgPT09IDBcblx0XHQpIHtcblx0XHRcdGlmIChuZXdfZGVwcyAhPT0gbnVsbCAmJiBuZXdfZGVwcy5pbmNsdWRlcyhzb3VyY2UpKSB7XG5cdFx0XHRcdHNldF9zaWduYWxfc3RhdHVzKGFjdGl2ZV9lZmZlY3QsIERJUlRZKTtcblx0XHRcdFx0c2NoZWR1bGVfZWZmZWN0KGFjdGl2ZV9lZmZlY3QpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0aWYgKHVudHJhY2tlZF93cml0ZXMgPT09IG51bGwpIHtcblx0XHRcdFx0XHRzZXRfdW50cmFja2VkX3dyaXRlcyhbc291cmNlXSk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0dW50cmFja2VkX3dyaXRlcy5wdXNoKHNvdXJjZSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cblx0XHRpZiAoREVWICYmIGluc3BlY3RfZWZmZWN0cy5zaXplID4gMCkge1xuXHRcdFx0Y29uc3QgaW5zcGVjdHMgPSBBcnJheS5mcm9tKGluc3BlY3RfZWZmZWN0cyk7XG5cdFx0XHR2YXIgcHJldmlvdXNseV9mbHVzaGluZ19lZmZlY3QgPSBpc19mbHVzaGluZ19lZmZlY3Q7XG5cdFx0XHRzZXRfaXNfZmx1c2hpbmdfZWZmZWN0KHRydWUpO1xuXHRcdFx0dHJ5IHtcblx0XHRcdFx0Zm9yIChjb25zdCBlZmZlY3Qgb2YgaW5zcGVjdHMpIHtcblx0XHRcdFx0XHQvLyBNYXJrIGNsZWFuIGluc3BlY3QtZWZmZWN0cyBhcyBtYXliZSBkaXJ0eSBhbmQgdGhlbiBjaGVjayB0aGVpciBkaXJ0aW5lc3Ncblx0XHRcdFx0XHQvLyBpbnN0ZWFkIG9mIGp1c3QgdXBkYXRpbmcgdGhlIGVmZmVjdHMgLSB0aGlzIHdheSB3ZSBhdm9pZCBvdmVyZmlyaW5nLlxuXHRcdFx0XHRcdGlmICgoZWZmZWN0LmYgJiBDTEVBTikgIT09IDApIHtcblx0XHRcdFx0XHRcdHNldF9zaWduYWxfc3RhdHVzKGVmZmVjdCwgTUFZQkVfRElSVFkpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRpZiAoY2hlY2tfZGlydGluZXNzKGVmZmVjdCkpIHtcblx0XHRcdFx0XHRcdHVwZGF0ZV9lZmZlY3QoZWZmZWN0KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH0gZmluYWxseSB7XG5cdFx0XHRcdHNldF9pc19mbHVzaGluZ19lZmZlY3QocHJldmlvdXNseV9mbHVzaGluZ19lZmZlY3QpO1xuXHRcdFx0fVxuXHRcdFx0aW5zcGVjdF9lZmZlY3RzLmNsZWFyKCk7XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIHZhbHVlO1xufVxuXG4vKipcbiAqIEBwYXJhbSB7VmFsdWV9IHNpZ25hbFxuICogQHBhcmFtIHtudW1iZXJ9IHN0YXR1cyBzaG91bGQgYmUgRElSVFkgb3IgTUFZQkVfRElSVFlcbiAqIEByZXR1cm5zIHt2b2lkfVxuICovXG5mdW5jdGlvbiBtYXJrX3JlYWN0aW9ucyhzaWduYWwsIHN0YXR1cykge1xuXHR2YXIgcmVhY3Rpb25zID0gc2lnbmFsLnJlYWN0aW9ucztcblx0aWYgKHJlYWN0aW9ucyA9PT0gbnVsbCkgcmV0dXJuO1xuXG5cdHZhciBydW5lcyA9IGlzX3J1bmVzKCk7XG5cdHZhciBsZW5ndGggPSByZWFjdGlvbnMubGVuZ3RoO1xuXG5cdGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcblx0XHR2YXIgcmVhY3Rpb24gPSByZWFjdGlvbnNbaV07XG5cdFx0dmFyIGZsYWdzID0gcmVhY3Rpb24uZjtcblxuXHRcdC8vIFNraXAgYW55IGVmZmVjdHMgdGhhdCBhcmUgYWxyZWFkeSBkaXJ0eVxuXHRcdGlmICgoZmxhZ3MgJiBESVJUWSkgIT09IDApIGNvbnRpbnVlO1xuXG5cdFx0Ly8gSW4gbGVnYWN5IG1vZGUsIHNraXAgdGhlIGN1cnJlbnQgZWZmZWN0IHRvIHByZXZlbnQgaW5maW5pdGUgbG9vcHNcblx0XHRpZiAoIXJ1bmVzICYmIHJlYWN0aW9uID09PSBhY3RpdmVfZWZmZWN0KSBjb250aW51ZTtcblxuXHRcdC8vIEluc3BlY3QgZWZmZWN0cyBuZWVkIHRvIHJ1biBpbW1lZGlhdGVseSwgc28gdGhhdCB0aGUgc3RhY2sgdHJhY2UgbWFrZXMgc2Vuc2Vcblx0XHRpZiAoREVWICYmIChmbGFncyAmIElOU1BFQ1RfRUZGRUNUKSAhPT0gMCkge1xuXHRcdFx0aW5zcGVjdF9lZmZlY3RzLmFkZChyZWFjdGlvbik7XG5cdFx0XHRjb250aW51ZTtcblx0XHR9XG5cblx0XHRzZXRfc2lnbmFsX3N0YXR1cyhyZWFjdGlvbiwgc3RhdHVzKTtcblxuXHRcdC8vIElmIHRoZSBzaWduYWwgYSkgd2FzIHByZXZpb3VzbHkgY2xlYW4gb3IgYikgaXMgYW4gdW5vd25lZCBkZXJpdmVkLCB0aGVuIG1hcmsgaXRcblx0XHRpZiAoKGZsYWdzICYgKENMRUFOIHwgVU5PV05FRCkpICE9PSAwKSB7XG5cdFx0XHRpZiAoKGZsYWdzICYgREVSSVZFRCkgIT09IDApIHtcblx0XHRcdFx0bWFya19yZWFjdGlvbnMoLyoqIEB0eXBlIHtEZXJpdmVkfSAqLyAocmVhY3Rpb24pLCBNQVlCRV9ESVJUWSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRzY2hlZHVsZV9lZmZlY3QoLyoqIEB0eXBlIHtFZmZlY3R9ICovIChyZWFjdGlvbikpO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxufVxuIiwiLyoqIEBpbXBvcnQgeyBQcm94eU1ldGFkYXRhLCBQcm94eVN0YXRlT2JqZWN0LCBTb3VyY2UgfSBmcm9tICcjY2xpZW50JyAqL1xuaW1wb3J0IHsgREVWIH0gZnJvbSAnZXNtLWVudic7XG5pbXBvcnQgeyBnZXQsIGNvbXBvbmVudF9jb250ZXh0LCBhY3RpdmVfZWZmZWN0IH0gZnJvbSAnLi9ydW50aW1lLmpzJztcbmltcG9ydCB7XG5cdGFycmF5X3Byb3RvdHlwZSxcblx0Z2V0X2Rlc2NyaXB0b3IsXG5cdGdldF9wcm90b3R5cGVfb2YsXG5cdGlzX2FycmF5LFxuXHRvYmplY3RfcHJvdG90eXBlXG59IGZyb20gJy4uL3NoYXJlZC91dGlscy5qcyc7XG5pbXBvcnQgeyBjaGVja19vd25lcnNoaXAsIHdpZGVuX293bmVyc2hpcCB9IGZyb20gJy4vZGV2L293bmVyc2hpcC5qcyc7XG5pbXBvcnQgeyBzb3VyY2UsIHNldCB9IGZyb20gJy4vcmVhY3Rpdml0eS9zb3VyY2VzLmpzJztcbmltcG9ydCB7IFNUQVRFX1NZTUJPTCwgU1RBVEVfU1lNQk9MX01FVEFEQVRBIH0gZnJvbSAnLi9jb25zdGFudHMuanMnO1xuaW1wb3J0IHsgVU5JTklUSUFMSVpFRCB9IGZyb20gJy4uLy4uL2NvbnN0YW50cy5qcyc7XG5pbXBvcnQgKiBhcyBlIGZyb20gJy4vZXJyb3JzLmpzJztcbmltcG9ydCB7IGdldF9zdGFjayB9IGZyb20gJy4vZGV2L3RyYWNpbmcuanMnO1xuaW1wb3J0IHsgdHJhY2luZ19tb2RlX2ZsYWcgfSBmcm9tICcuLi9mbGFncy9pbmRleC5qcyc7XG5cbi8qKlxuICogQHRlbXBsYXRlIFRcbiAqIEBwYXJhbSB7VH0gdmFsdWVcbiAqIEBwYXJhbSB7UHJveHlNZXRhZGF0YSB8IG51bGx9IFtwYXJlbnRdXG4gKiBAcGFyYW0ge1NvdXJjZTxUPn0gW3ByZXZdIGRldiBtb2RlIG9ubHlcbiAqIEByZXR1cm5zIHtUfVxuICovXG5leHBvcnQgZnVuY3Rpb24gcHJveHkodmFsdWUsIHBhcmVudCA9IG51bGwsIHByZXYpIHtcblx0LyoqIEB0eXBlIHtFcnJvciB8IG51bGx9ICovXG5cdHZhciBzdGFjayA9IG51bGw7XG5cdGlmIChERVYgJiYgdHJhY2luZ19tb2RlX2ZsYWcpIHtcblx0XHRzdGFjayA9IGdldF9zdGFjaygnQ3JlYXRlZEF0Jyk7XG5cdH1cblx0Ly8gaWYgbm9uLXByb3h5YWJsZSwgb3IgaXMgYWxyZWFkeSBhIHByb3h5LCByZXR1cm4gYHZhbHVlYFxuXHRpZiAodHlwZW9mIHZhbHVlICE9PSAnb2JqZWN0JyB8fCB2YWx1ZSA9PT0gbnVsbCB8fCBTVEFURV9TWU1CT0wgaW4gdmFsdWUpIHtcblx0XHRyZXR1cm4gdmFsdWU7XG5cdH1cblxuXHRjb25zdCBwcm90b3R5cGUgPSBnZXRfcHJvdG90eXBlX29mKHZhbHVlKTtcblxuXHRpZiAocHJvdG90eXBlICE9PSBvYmplY3RfcHJvdG90eXBlICYmIHByb3RvdHlwZSAhPT0gYXJyYXlfcHJvdG90eXBlKSB7XG5cdFx0cmV0dXJuIHZhbHVlO1xuXHR9XG5cblx0LyoqIEB0eXBlIHtNYXA8YW55LCBTb3VyY2U8YW55Pj59ICovXG5cdHZhciBzb3VyY2VzID0gbmV3IE1hcCgpO1xuXHR2YXIgaXNfcHJveGllZF9hcnJheSA9IGlzX2FycmF5KHZhbHVlKTtcblx0dmFyIHZlcnNpb24gPSBzb3VyY2UoMCk7XG5cblx0aWYgKGlzX3Byb3hpZWRfYXJyYXkpIHtcblx0XHQvLyBXZSBuZWVkIHRvIGNyZWF0ZSB0aGUgbGVuZ3RoIHNvdXJjZSBlYWdlcmx5IHRvIGVuc3VyZSB0aGF0XG5cdFx0Ly8gbXV0YXRpb25zIHRvIHRoZSBhcnJheSBhcmUgcHJvcGVybHkgc3luY2VkIHdpdGggb3VyIHByb3h5XG5cdFx0c291cmNlcy5zZXQoJ2xlbmd0aCcsIHNvdXJjZSgvKiogQHR5cGUge2FueVtdfSAqLyAodmFsdWUpLmxlbmd0aCwgc3RhY2spKTtcblx0fVxuXG5cdC8qKiBAdHlwZSB7UHJveHlNZXRhZGF0YX0gKi9cblx0dmFyIG1ldGFkYXRhO1xuXG5cdGlmIChERVYpIHtcblx0XHRtZXRhZGF0YSA9IHtcblx0XHRcdHBhcmVudCxcblx0XHRcdG93bmVyczogbnVsbFxuXHRcdH07XG5cblx0XHRpZiAocHJldikge1xuXHRcdFx0Ly8gUmV1c2Ugb3duZXJzIGZyb20gcHJldmlvdXMgc3RhdGU7IG5lY2Vzc2FyeSBiZWNhdXNlIHJlYXNzaWdubWVudCBpcyBub3QgZ3VhcmFudGVlZCB0byBoYXZlIGNvcnJlY3QgY29tcG9uZW50IGNvbnRleHQuXG5cdFx0XHQvLyBJZiBubyBwcmV2aW91cyBwcm94eSBleGlzdHMgd2UgcGxheSBpdCBzYWZlIGFuZCBhc3N1bWUgb3duZXJsZXNzIHN0YXRlXG5cdFx0XHQvLyBAdHMtZXhwZWN0LWVycm9yXG5cdFx0XHRjb25zdCBwcmV2X293bmVycyA9IHByZXYudj8uW1NUQVRFX1NZTUJPTF9NRVRBREFUQV0/Lm93bmVycztcblx0XHRcdG1ldGFkYXRhLm93bmVycyA9IHByZXZfb3duZXJzID8gbmV3IFNldChwcmV2X293bmVycykgOiBudWxsO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRtZXRhZGF0YS5vd25lcnMgPVxuXHRcdFx0XHRwYXJlbnQgPT09IG51bGxcblx0XHRcdFx0XHQ/IGNvbXBvbmVudF9jb250ZXh0ICE9PSBudWxsXG5cdFx0XHRcdFx0XHQ/IG5ldyBTZXQoW2NvbXBvbmVudF9jb250ZXh0LmZ1bmN0aW9uXSlcblx0XHRcdFx0XHRcdDogbnVsbFxuXHRcdFx0XHRcdDogbmV3IFNldCgpO1xuXHRcdH1cblx0fVxuXG5cdHJldHVybiBuZXcgUHJveHkoLyoqIEB0eXBlIHthbnl9ICovICh2YWx1ZSksIHtcblx0XHRkZWZpbmVQcm9wZXJ0eShfLCBwcm9wLCBkZXNjcmlwdG9yKSB7XG5cdFx0XHRpZiAoXG5cdFx0XHRcdCEoJ3ZhbHVlJyBpbiBkZXNjcmlwdG9yKSB8fFxuXHRcdFx0XHRkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9PT0gZmFsc2UgfHxcblx0XHRcdFx0ZGVzY3JpcHRvci5lbnVtZXJhYmxlID09PSBmYWxzZSB8fFxuXHRcdFx0XHRkZXNjcmlwdG9yLndyaXRhYmxlID09PSBmYWxzZVxuXHRcdFx0KSB7XG5cdFx0XHRcdC8vIHdlIGRpc2FsbG93IG5vbi1iYXNpYyBkZXNjcmlwdG9ycywgYmVjYXVzZSB1bmxlc3MgdGhleSBhcmUgYXBwbGllZCB0byB0aGVcblx0XHRcdFx0Ly8gdGFyZ2V0IG9iamVjdCDigJQgd2hpY2ggd2UgYXZvaWQsIHNvIHRoYXQgc3RhdGUgY2FuIGJlIGZvcmtlZCDigJQgd2Ugd2lsbCBydW5cblx0XHRcdFx0Ly8gYWZvdWwgb2YgdGhlIHZhcmlvdXMgaW52YXJpYW50c1xuXHRcdFx0XHQvLyBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9Qcm94eS9Qcm94eS9nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IjaW52YXJpYW50c1xuXHRcdFx0XHRlLnN0YXRlX2Rlc2NyaXB0b3JzX2ZpeGVkKCk7XG5cdFx0XHR9XG5cblx0XHRcdHZhciBzID0gc291cmNlcy5nZXQocHJvcCk7XG5cblx0XHRcdGlmIChzID09PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0cyA9IHNvdXJjZShkZXNjcmlwdG9yLnZhbHVlLCBzdGFjayk7XG5cdFx0XHRcdHNvdXJjZXMuc2V0KHByb3AsIHMpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0c2V0KHMsIHByb3h5KGRlc2NyaXB0b3IudmFsdWUsIG1ldGFkYXRhKSk7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH0sXG5cblx0XHRkZWxldGVQcm9wZXJ0eSh0YXJnZXQsIHByb3ApIHtcblx0XHRcdHZhciBzID0gc291cmNlcy5nZXQocHJvcCk7XG5cblx0XHRcdGlmIChzID09PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0aWYgKHByb3AgaW4gdGFyZ2V0KSB7XG5cdFx0XHRcdFx0c291cmNlcy5zZXQocHJvcCwgc291cmNlKFVOSU5JVElBTElaRUQsIHN0YWNrKSk7XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdC8vIFdoZW4gd29ya2luZyB3aXRoIGFycmF5cywgd2UgbmVlZCB0byBhbHNvIGVuc3VyZSB3ZSB1cGRhdGUgdGhlIGxlbmd0aCB3aGVuIHJlbW92aW5nXG5cdFx0XHRcdC8vIGFuIGluZGV4ZWQgcHJvcGVydHlcblx0XHRcdFx0aWYgKGlzX3Byb3hpZWRfYXJyYXkgJiYgdHlwZW9mIHByb3AgPT09ICdzdHJpbmcnKSB7XG5cdFx0XHRcdFx0dmFyIGxzID0gLyoqIEB0eXBlIHtTb3VyY2U8bnVtYmVyPn0gKi8gKHNvdXJjZXMuZ2V0KCdsZW5ndGgnKSk7XG5cdFx0XHRcdFx0dmFyIG4gPSBOdW1iZXIocHJvcCk7XG5cblx0XHRcdFx0XHRpZiAoTnVtYmVyLmlzSW50ZWdlcihuKSAmJiBuIDwgbHMudikge1xuXHRcdFx0XHRcdFx0c2V0KGxzLCBuKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0c2V0KHMsIFVOSU5JVElBTElaRUQpO1xuXHRcdFx0XHR1cGRhdGVfdmVyc2lvbih2ZXJzaW9uKTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fSxcblxuXHRcdGdldCh0YXJnZXQsIHByb3AsIHJlY2VpdmVyKSB7XG5cdFx0XHRpZiAoREVWICYmIHByb3AgPT09IFNUQVRFX1NZTUJPTF9NRVRBREFUQSkge1xuXHRcdFx0XHRyZXR1cm4gbWV0YWRhdGE7XG5cdFx0XHR9XG5cblx0XHRcdGlmIChwcm9wID09PSBTVEFURV9TWU1CT0wpIHtcblx0XHRcdFx0cmV0dXJuIHZhbHVlO1xuXHRcdFx0fVxuXG5cdFx0XHR2YXIgcyA9IHNvdXJjZXMuZ2V0KHByb3ApO1xuXHRcdFx0dmFyIGV4aXN0cyA9IHByb3AgaW4gdGFyZ2V0O1xuXG5cdFx0XHQvLyBjcmVhdGUgYSBzb3VyY2UsIGJ1dCBvbmx5IGlmIGl0J3MgYW4gb3duIHByb3BlcnR5IGFuZCBub3QgYSBwcm90b3R5cGUgcHJvcGVydHlcblx0XHRcdGlmIChzID09PSB1bmRlZmluZWQgJiYgKCFleGlzdHMgfHwgZ2V0X2Rlc2NyaXB0b3IodGFyZ2V0LCBwcm9wKT8ud3JpdGFibGUpKSB7XG5cdFx0XHRcdHMgPSBzb3VyY2UocHJveHkoZXhpc3RzID8gdGFyZ2V0W3Byb3BdIDogVU5JTklUSUFMSVpFRCwgbWV0YWRhdGEpLCBzdGFjayk7XG5cdFx0XHRcdHNvdXJjZXMuc2V0KHByb3AsIHMpO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAocyAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdHZhciB2ID0gZ2V0KHMpO1xuXG5cdFx0XHRcdC8vIEluIGNhc2Ugb2Ygc29tZXRoaW5nIGxpa2UgYGZvbyA9IGJhci5tYXAoLi4uKWAsIGZvbyB3b3VsZCBoYXZlIG93bmVyc2hpcFxuXHRcdFx0XHQvLyBvZiB0aGUgYXJyYXkgaXRzZWxmLCB3aGlsZSB0aGUgaW5kaXZpZHVhbCBpdGVtcyB3b3VsZCBoYXZlIG93bmVyc2hpcFxuXHRcdFx0XHQvLyBvZiB0aGUgY29tcG9uZW50IHRoYXQgY3JlYXRlZCBiYXIuIFRoYXQgbWVhbnMgaWYgd2UgbGF0ZXIgZG8gYGZvb1swXS5iYXogPSA0MmAsXG5cdFx0XHRcdC8vIHdlIGNvdWxkIGdldCBhIGZhbHNlLXBvc2l0aXZlIG93bmVyc2hpcCB2aW9sYXRpb24sIHNpbmNlIHRoZSB0d28gcHJveGllc1xuXHRcdFx0XHQvLyBhcmUgbm90IGNvbm5lY3RlZCB0byBlYWNoIG90aGVyIHZpYSB0aGUgcGFyZW50IG1ldGFkYXRhIHJlbGF0aW9uc2hpcC5cblx0XHRcdFx0Ly8gRm9yIHRoaXMgcmVhc29uLCB3ZSBuZWVkIHRvIHdpZGVuIHRoZSBvd25lcnNoaXAgb2YgdGhlIGNoaWxkcmVuXG5cdFx0XHRcdC8vIHVwb24gYWNjZXNzIHdoZW4gd2UgZGV0ZWN0IHRoZXkgYXJlIG5vdCBjb25uZWN0ZWQuXG5cdFx0XHRcdGlmIChERVYpIHtcblx0XHRcdFx0XHQvKiogQHR5cGUge1Byb3h5TWV0YWRhdGEgfCB1bmRlZmluZWR9ICovXG5cdFx0XHRcdFx0dmFyIHByb3BfbWV0YWRhdGEgPSB2Py5bU1RBVEVfU1lNQk9MX01FVEFEQVRBXTtcblx0XHRcdFx0XHRpZiAocHJvcF9tZXRhZGF0YSAmJiBwcm9wX21ldGFkYXRhPy5wYXJlbnQgIT09IG1ldGFkYXRhKSB7XG5cdFx0XHRcdFx0XHR3aWRlbl9vd25lcnNoaXAobWV0YWRhdGEsIHByb3BfbWV0YWRhdGEpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXG5cdFx0XHRcdHJldHVybiB2ID09PSBVTklOSVRJQUxJWkVEID8gdW5kZWZpbmVkIDogdjtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIFJlZmxlY3QuZ2V0KHRhcmdldCwgcHJvcCwgcmVjZWl2ZXIpO1xuXHRcdH0sXG5cblx0XHRnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodGFyZ2V0LCBwcm9wKSB7XG5cdFx0XHR2YXIgZGVzY3JpcHRvciA9IFJlZmxlY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHRhcmdldCwgcHJvcCk7XG5cblx0XHRcdGlmIChkZXNjcmlwdG9yICYmICd2YWx1ZScgaW4gZGVzY3JpcHRvcikge1xuXHRcdFx0XHR2YXIgcyA9IHNvdXJjZXMuZ2V0KHByb3ApO1xuXHRcdFx0XHRpZiAocykgZGVzY3JpcHRvci52YWx1ZSA9IGdldChzKTtcblx0XHRcdH0gZWxzZSBpZiAoZGVzY3JpcHRvciA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdHZhciBzb3VyY2UgPSBzb3VyY2VzLmdldChwcm9wKTtcblx0XHRcdFx0dmFyIHZhbHVlID0gc291cmNlPy52O1xuXG5cdFx0XHRcdGlmIChzb3VyY2UgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gVU5JTklUSUFMSVpFRCkge1xuXHRcdFx0XHRcdHJldHVybiB7XG5cdFx0XHRcdFx0XHRlbnVtZXJhYmxlOiB0cnVlLFxuXHRcdFx0XHRcdFx0Y29uZmlndXJhYmxlOiB0cnVlLFxuXHRcdFx0XHRcdFx0dmFsdWUsXG5cdFx0XHRcdFx0XHR3cml0YWJsZTogdHJ1ZVxuXHRcdFx0XHRcdH07XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIGRlc2NyaXB0b3I7XG5cdFx0fSxcblxuXHRcdGhhcyh0YXJnZXQsIHByb3ApIHtcblx0XHRcdGlmIChERVYgJiYgcHJvcCA9PT0gU1RBVEVfU1lNQk9MX01FVEFEQVRBKSB7XG5cdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAocHJvcCA9PT0gU1RBVEVfU1lNQk9MKSB7XG5cdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0fVxuXG5cdFx0XHR2YXIgcyA9IHNvdXJjZXMuZ2V0KHByb3ApO1xuXHRcdFx0dmFyIGhhcyA9IChzICE9PSB1bmRlZmluZWQgJiYgcy52ICE9PSBVTklOSVRJQUxJWkVEKSB8fCBSZWZsZWN0Lmhhcyh0YXJnZXQsIHByb3ApO1xuXG5cdFx0XHRpZiAoXG5cdFx0XHRcdHMgIT09IHVuZGVmaW5lZCB8fFxuXHRcdFx0XHQoYWN0aXZlX2VmZmVjdCAhPT0gbnVsbCAmJiAoIWhhcyB8fCBnZXRfZGVzY3JpcHRvcih0YXJnZXQsIHByb3ApPy53cml0YWJsZSkpXG5cdFx0XHQpIHtcblx0XHRcdFx0aWYgKHMgPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRcdHMgPSBzb3VyY2UoaGFzID8gcHJveHkodGFyZ2V0W3Byb3BdLCBtZXRhZGF0YSkgOiBVTklOSVRJQUxJWkVELCBzdGFjayk7XG5cdFx0XHRcdFx0c291cmNlcy5zZXQocHJvcCwgcyk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHR2YXIgdmFsdWUgPSBnZXQocyk7XG5cdFx0XHRcdGlmICh2YWx1ZSA9PT0gVU5JTklUSUFMSVpFRCkge1xuXHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gaGFzO1xuXHRcdH0sXG5cblx0XHRzZXQodGFyZ2V0LCBwcm9wLCB2YWx1ZSwgcmVjZWl2ZXIpIHtcblx0XHRcdHZhciBzID0gc291cmNlcy5nZXQocHJvcCk7XG5cdFx0XHR2YXIgaGFzID0gcHJvcCBpbiB0YXJnZXQ7XG5cblx0XHRcdC8vIHZhcmlhYmxlLmxlbmd0aCA9IHZhbHVlIC0+IGNsZWFyIGFsbCBzaWduYWxzIHdpdGggaW5kZXggPj0gdmFsdWVcblx0XHRcdGlmIChpc19wcm94aWVkX2FycmF5ICYmIHByb3AgPT09ICdsZW5ndGgnKSB7XG5cdFx0XHRcdGZvciAodmFyIGkgPSB2YWx1ZTsgaSA8IC8qKiBAdHlwZSB7U291cmNlPG51bWJlcj59ICovIChzKS52OyBpICs9IDEpIHtcblx0XHRcdFx0XHR2YXIgb3RoZXJfcyA9IHNvdXJjZXMuZ2V0KGkgKyAnJyk7XG5cdFx0XHRcdFx0aWYgKG90aGVyX3MgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRcdFx0c2V0KG90aGVyX3MsIFVOSU5JVElBTElaRUQpO1xuXHRcdFx0XHRcdH0gZWxzZSBpZiAoaSBpbiB0YXJnZXQpIHtcblx0XHRcdFx0XHRcdC8vIElmIHRoZSBpdGVtIGV4aXN0cyBpbiB0aGUgb3JpZ2luYWwsIHdlIG5lZWQgdG8gY3JlYXRlIGEgdW5pbml0aWFsaXplZCBzb3VyY2UsXG5cdFx0XHRcdFx0XHQvLyBlbHNlIGEgbGF0ZXIgcmVhZCBvZiB0aGUgcHJvcGVydHkgd291bGQgcmVzdWx0IGluIGEgc291cmNlIGJlaW5nIGNyZWF0ZWQgd2l0aFxuXHRcdFx0XHRcdFx0Ly8gdGhlIHZhbHVlIG9mIHRoZSBvcmlnaW5hbCBpdGVtIGF0IHRoYXQgaW5kZXguXG5cdFx0XHRcdFx0XHRvdGhlcl9zID0gc291cmNlKFVOSU5JVElBTElaRUQsIHN0YWNrKTtcblx0XHRcdFx0XHRcdHNvdXJjZXMuc2V0KGkgKyAnJywgb3RoZXJfcyk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdC8vIElmIHdlIGhhdmVuJ3QgeWV0IGNyZWF0ZWQgYSBzb3VyY2UgZm9yIHRoaXMgcHJvcGVydHksIHdlIG5lZWQgdG8gZW5zdXJlXG5cdFx0XHQvLyB3ZSBkbyBzbyBvdGhlcndpc2UgaWYgd2UgcmVhZCBpdCBsYXRlciwgdGhlbiB0aGUgd3JpdGUgd29uJ3QgYmUgdHJhY2tlZCBhbmRcblx0XHRcdC8vIHRoZSBoZXVyaXN0aWNzIG9mIGVmZmVjdHMgd2lsbCBiZSBkaWZmZXJlbnQgdnMgaWYgd2UgaGFkIHJlYWQgdGhlIHByb3hpZWRcblx0XHRcdC8vIG9iamVjdCBwcm9wZXJ0eSBiZWZvcmUgd3JpdGluZyB0byB0aGF0IHByb3BlcnR5LlxuXHRcdFx0aWYgKHMgPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRpZiAoIWhhcyB8fCBnZXRfZGVzY3JpcHRvcih0YXJnZXQsIHByb3ApPy53cml0YWJsZSkge1xuXHRcdFx0XHRcdHMgPSBzb3VyY2UodW5kZWZpbmVkLCBzdGFjayk7XG5cdFx0XHRcdFx0c2V0KHMsIHByb3h5KHZhbHVlLCBtZXRhZGF0YSkpO1xuXHRcdFx0XHRcdHNvdXJjZXMuc2V0KHByb3AsIHMpO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRoYXMgPSBzLnYgIT09IFVOSU5JVElBTElaRUQ7XG5cdFx0XHRcdHNldChzLCBwcm94eSh2YWx1ZSwgbWV0YWRhdGEpKTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKERFVikge1xuXHRcdFx0XHQvKiogQHR5cGUge1Byb3h5TWV0YWRhdGEgfCB1bmRlZmluZWR9ICovXG5cdFx0XHRcdHZhciBwcm9wX21ldGFkYXRhID0gdmFsdWU/LltTVEFURV9TWU1CT0xfTUVUQURBVEFdO1xuXHRcdFx0XHRpZiAocHJvcF9tZXRhZGF0YSAmJiBwcm9wX21ldGFkYXRhPy5wYXJlbnQgIT09IG1ldGFkYXRhKSB7XG5cdFx0XHRcdFx0d2lkZW5fb3duZXJzaGlwKG1ldGFkYXRhLCBwcm9wX21ldGFkYXRhKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRjaGVja19vd25lcnNoaXAobWV0YWRhdGEpO1xuXHRcdFx0fVxuXG5cdFx0XHR2YXIgZGVzY3JpcHRvciA9IFJlZmxlY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHRhcmdldCwgcHJvcCk7XG5cblx0XHRcdC8vIFNldCB0aGUgbmV3IHZhbHVlIGJlZm9yZSB1cGRhdGluZyBhbnkgc2lnbmFscyBzbyB0aGF0IGFueSBsaXN0ZW5lcnMgZ2V0IHRoZSBuZXcgdmFsdWVcblx0XHRcdGlmIChkZXNjcmlwdG9yPy5zZXQpIHtcblx0XHRcdFx0ZGVzY3JpcHRvci5zZXQuY2FsbChyZWNlaXZlciwgdmFsdWUpO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoIWhhcykge1xuXHRcdFx0XHQvLyBJZiB3ZSBoYXZlIG11dGF0ZWQgYW4gYXJyYXkgZGlyZWN0bHksIHdlIG1pZ2h0IG5lZWQgdG9cblx0XHRcdFx0Ly8gc2lnbmFsIHRoYXQgbGVuZ3RoIGhhcyBhbHNvIGNoYW5nZWQuIERvIGl0IGJlZm9yZSB1cGRhdGluZyBtZXRhZGF0YVxuXHRcdFx0XHQvLyB0byBlbnN1cmUgdGhhdCBpdGVyYXRpbmcgb3ZlciB0aGUgYXJyYXkgYXMgYSByZXN1bHQgb2YgYSBtZXRhZGF0YSB1cGRhdGVcblx0XHRcdFx0Ly8gd2lsbCBub3QgY2F1c2UgdGhlIGxlbmd0aCB0byBiZSBvdXQgb2Ygc3luYy5cblx0XHRcdFx0aWYgKGlzX3Byb3hpZWRfYXJyYXkgJiYgdHlwZW9mIHByb3AgPT09ICdzdHJpbmcnKSB7XG5cdFx0XHRcdFx0dmFyIGxzID0gLyoqIEB0eXBlIHtTb3VyY2U8bnVtYmVyPn0gKi8gKHNvdXJjZXMuZ2V0KCdsZW5ndGgnKSk7XG5cdFx0XHRcdFx0dmFyIG4gPSBOdW1iZXIocHJvcCk7XG5cblx0XHRcdFx0XHRpZiAoTnVtYmVyLmlzSW50ZWdlcihuKSAmJiBuID49IGxzLnYpIHtcblx0XHRcdFx0XHRcdHNldChscywgbiArIDEpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXG5cdFx0XHRcdHVwZGF0ZV92ZXJzaW9uKHZlcnNpb24pO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9LFxuXG5cdFx0b3duS2V5cyh0YXJnZXQpIHtcblx0XHRcdGdldCh2ZXJzaW9uKTtcblxuXHRcdFx0dmFyIG93bl9rZXlzID0gUmVmbGVjdC5vd25LZXlzKHRhcmdldCkuZmlsdGVyKChrZXkpID0+IHtcblx0XHRcdFx0dmFyIHNvdXJjZSA9IHNvdXJjZXMuZ2V0KGtleSk7XG5cdFx0XHRcdHJldHVybiBzb3VyY2UgPT09IHVuZGVmaW5lZCB8fCBzb3VyY2UudiAhPT0gVU5JTklUSUFMSVpFRDtcblx0XHRcdH0pO1xuXG5cdFx0XHRmb3IgKHZhciBba2V5LCBzb3VyY2VdIG9mIHNvdXJjZXMpIHtcblx0XHRcdFx0aWYgKHNvdXJjZS52ICE9PSBVTklOSVRJQUxJWkVEICYmICEoa2V5IGluIHRhcmdldCkpIHtcblx0XHRcdFx0XHRvd25fa2V5cy5wdXNoKGtleSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIG93bl9rZXlzO1xuXHRcdH0sXG5cblx0XHRzZXRQcm90b3R5cGVPZigpIHtcblx0XHRcdGUuc3RhdGVfcHJvdG90eXBlX2ZpeGVkKCk7XG5cdFx0fVxuXHR9KTtcbn1cblxuLyoqXG4gKiBAcGFyYW0ge1NvdXJjZTxudW1iZXI+fSBzaWduYWxcbiAqIEBwYXJhbSB7MSB8IC0xfSBbZF1cbiAqL1xuZnVuY3Rpb24gdXBkYXRlX3ZlcnNpb24oc2lnbmFsLCBkID0gMSkge1xuXHRzZXQoc2lnbmFsLCBzaWduYWwudiArIGQpO1xufVxuXG4vKipcbiAqIEBwYXJhbSB7YW55fSB2YWx1ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0X3Byb3hpZWRfdmFsdWUodmFsdWUpIHtcblx0aWYgKHZhbHVlICE9PSBudWxsICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiYgU1RBVEVfU1lNQk9MIGluIHZhbHVlKSB7XG5cdFx0cmV0dXJuIHZhbHVlW1NUQVRFX1NZTUJPTF07XG5cdH1cblxuXHRyZXR1cm4gdmFsdWU7XG59XG5cbi8qKlxuICogQHBhcmFtIHthbnl9IGFcbiAqIEBwYXJhbSB7YW55fSBiXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpcyhhLCBiKSB7XG5cdHJldHVybiBPYmplY3QuaXMoZ2V0X3Byb3hpZWRfdmFsdWUoYSksIGdldF9wcm94aWVkX3ZhbHVlKGIpKTtcbn1cbiIsIi8qKiBAaW1wb3J0IHsgVGVtcGxhdGVOb2RlIH0gZnJvbSAnI2NsaWVudCcgKi9cbmltcG9ydCB7IGh5ZHJhdGVfbm9kZSwgaHlkcmF0aW5nLCBzZXRfaHlkcmF0ZV9ub2RlIH0gZnJvbSAnLi9oeWRyYXRpb24uanMnO1xuaW1wb3J0IHsgREVWIH0gZnJvbSAnZXNtLWVudic7XG5pbXBvcnQgeyBpbml0X2FycmF5X3Byb3RvdHlwZV93YXJuaW5ncyB9IGZyb20gJy4uL2Rldi9lcXVhbGl0eS5qcyc7XG5pbXBvcnQgeyBnZXRfZGVzY3JpcHRvciB9IGZyb20gJy4uLy4uL3NoYXJlZC91dGlscy5qcyc7XG5cbi8vIGV4cG9ydCB0aGVzZSBmb3IgcmVmZXJlbmNlIGluIHRoZSBjb21waWxlZCBjb2RlLCBtYWtpbmcgZ2xvYmFsIG5hbWUgZGVkdXBsaWNhdGlvbiB1bm5lY2Vzc2FyeVxuLyoqIEB0eXBlIHtXaW5kb3d9ICovXG5leHBvcnQgdmFyICR3aW5kb3c7XG5cbi8qKiBAdHlwZSB7RG9jdW1lbnR9ICovXG5leHBvcnQgdmFyICRkb2N1bWVudDtcblxuLyoqIEB0eXBlIHsoKSA9PiBOb2RlIHwgbnVsbH0gKi9cbnZhciBmaXJzdF9jaGlsZF9nZXR0ZXI7XG4vKiogQHR5cGUgeygpID0+IE5vZGUgfCBudWxsfSAqL1xudmFyIG5leHRfc2libGluZ19nZXR0ZXI7XG5cbi8qKlxuICogSW5pdGlhbGl6ZSB0aGVzZSBsYXppbHkgdG8gYXZvaWQgaXNzdWVzIHdoZW4gdXNpbmcgdGhlIHJ1bnRpbWUgaW4gYSBzZXJ2ZXIgY29udGV4dFxuICogd2hlcmUgdGhlc2UgZ2xvYmFscyBhcmUgbm90IGF2YWlsYWJsZSB3aGlsZSBhdm9pZGluZyBhIHNlcGFyYXRlIHNlcnZlciBlbnRyeSBwb2ludFxuICovXG5leHBvcnQgZnVuY3Rpb24gaW5pdF9vcGVyYXRpb25zKCkge1xuXHRpZiAoJHdpbmRvdyAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuO1xuXHR9XG5cblx0JHdpbmRvdyA9IHdpbmRvdztcblx0JGRvY3VtZW50ID0gZG9jdW1lbnQ7XG5cblx0dmFyIGVsZW1lbnRfcHJvdG90eXBlID0gRWxlbWVudC5wcm90b3R5cGU7XG5cdHZhciBub2RlX3Byb3RvdHlwZSA9IE5vZGUucHJvdG90eXBlO1xuXG5cdC8vIEB0cy1pZ25vcmVcblx0Zmlyc3RfY2hpbGRfZ2V0dGVyID0gZ2V0X2Rlc2NyaXB0b3Iobm9kZV9wcm90b3R5cGUsICdmaXJzdENoaWxkJykuZ2V0O1xuXHQvLyBAdHMtaWdub3JlXG5cdG5leHRfc2libGluZ19nZXR0ZXIgPSBnZXRfZGVzY3JpcHRvcihub2RlX3Byb3RvdHlwZSwgJ25leHRTaWJsaW5nJykuZ2V0O1xuXG5cdC8vIHRoZSBmb2xsb3dpbmcgYXNzaWdubWVudHMgaW1wcm92ZSBwZXJmIG9mIGxvb2t1cHMgb24gRE9NIG5vZGVzXG5cdC8vIEB0cy1leHBlY3QtZXJyb3Jcblx0ZWxlbWVudF9wcm90b3R5cGUuX19jbGljayA9IHVuZGVmaW5lZDtcblx0Ly8gQHRzLWV4cGVjdC1lcnJvclxuXHRlbGVtZW50X3Byb3RvdHlwZS5fX2NsYXNzTmFtZSA9ICcnO1xuXHQvLyBAdHMtZXhwZWN0LWVycm9yXG5cdGVsZW1lbnRfcHJvdG90eXBlLl9fYXR0cmlidXRlcyA9IG51bGw7XG5cdC8vIEB0cy1leHBlY3QtZXJyb3Jcblx0ZWxlbWVudF9wcm90b3R5cGUuX19zdHlsZXMgPSBudWxsO1xuXHQvLyBAdHMtZXhwZWN0LWVycm9yXG5cdGVsZW1lbnRfcHJvdG90eXBlLl9fZSA9IHVuZGVmaW5lZDtcblxuXHQvLyBAdHMtZXhwZWN0LWVycm9yXG5cdFRleHQucHJvdG90eXBlLl9fdCA9IHVuZGVmaW5lZDtcblxuXHRpZiAoREVWKSB7XG5cdFx0Ly8gQHRzLWV4cGVjdC1lcnJvclxuXHRcdGVsZW1lbnRfcHJvdG90eXBlLl9fc3ZlbHRlX21ldGEgPSBudWxsO1xuXG5cdFx0aW5pdF9hcnJheV9wcm90b3R5cGVfd2FybmluZ3MoKTtcblx0fVxufVxuXG4vKipcbiAqIEBwYXJhbSB7c3RyaW5nfSB2YWx1ZVxuICogQHJldHVybnMge1RleHR9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVfdGV4dCh2YWx1ZSA9ICcnKSB7XG5cdHJldHVybiBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSh2YWx1ZSk7XG59XG5cbi8qKlxuICogQHRlbXBsYXRlIHtOb2RlfSBOXG4gKiBAcGFyYW0ge059IG5vZGVcbiAqIEByZXR1cm5zIHtOb2RlIHwgbnVsbH1cbiAqL1xuLypAX19OT19TSURFX0VGRkVDVFNfXyovXG5leHBvcnQgZnVuY3Rpb24gZ2V0X2ZpcnN0X2NoaWxkKG5vZGUpIHtcblx0cmV0dXJuIGZpcnN0X2NoaWxkX2dldHRlci5jYWxsKG5vZGUpO1xufVxuXG4vKipcbiAqIEB0ZW1wbGF0ZSB7Tm9kZX0gTlxuICogQHBhcmFtIHtOfSBub2RlXG4gKiBAcmV0dXJucyB7Tm9kZSB8IG51bGx9XG4gKi9cbi8qQF9fTk9fU0lERV9FRkZFQ1RTX18qL1xuZXhwb3J0IGZ1bmN0aW9uIGdldF9uZXh0X3NpYmxpbmcobm9kZSkge1xuXHRyZXR1cm4gbmV4dF9zaWJsaW5nX2dldHRlci5jYWxsKG5vZGUpO1xufVxuXG4vKipcbiAqIERvbid0IG1hcmsgdGhpcyBhcyBzaWRlLWVmZmVjdC1mcmVlLCBoeWRyYXRpb24gbmVlZHMgdG8gd2FsayBhbGwgbm9kZXNcbiAqIEB0ZW1wbGF0ZSB7Tm9kZX0gTlxuICogQHBhcmFtIHtOfSBub2RlXG4gKiBAcGFyYW0ge2Jvb2xlYW59IGlzX3RleHRcbiAqIEByZXR1cm5zIHtOb2RlIHwgbnVsbH1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNoaWxkKG5vZGUsIGlzX3RleHQpIHtcblx0aWYgKCFoeWRyYXRpbmcpIHtcblx0XHRyZXR1cm4gZ2V0X2ZpcnN0X2NoaWxkKG5vZGUpO1xuXHR9XG5cblx0dmFyIGNoaWxkID0gLyoqIEB0eXBlIHtUZW1wbGF0ZU5vZGV9ICovIChnZXRfZmlyc3RfY2hpbGQoaHlkcmF0ZV9ub2RlKSk7XG5cblx0Ly8gQ2hpbGQgY2FuIGJlIG51bGwgaWYgd2UgaGF2ZSBhbiBlbGVtZW50IHdpdGggYSBzaW5nbGUgY2hpbGQsIGxpa2UgYDxwPnt0ZXh0fTwvcD5gLCB3aGVyZSBgdGV4dGAgaXMgZW1wdHlcblx0aWYgKGNoaWxkID09PSBudWxsKSB7XG5cdFx0Y2hpbGQgPSBoeWRyYXRlX25vZGUuYXBwZW5kQ2hpbGQoY3JlYXRlX3RleHQoKSk7XG5cdH0gZWxzZSBpZiAoaXNfdGV4dCAmJiBjaGlsZC5ub2RlVHlwZSAhPT0gMykge1xuXHRcdHZhciB0ZXh0ID0gY3JlYXRlX3RleHQoKTtcblx0XHRjaGlsZD8uYmVmb3JlKHRleHQpO1xuXHRcdHNldF9oeWRyYXRlX25vZGUodGV4dCk7XG5cdFx0cmV0dXJuIHRleHQ7XG5cdH1cblxuXHRzZXRfaHlkcmF0ZV9ub2RlKGNoaWxkKTtcblx0cmV0dXJuIGNoaWxkO1xufVxuXG4vKipcbiAqIERvbid0IG1hcmsgdGhpcyBhcyBzaWRlLWVmZmVjdC1mcmVlLCBoeWRyYXRpb24gbmVlZHMgdG8gd2FsayBhbGwgbm9kZXNcbiAqIEBwYXJhbSB7RG9jdW1lbnRGcmFnbWVudCB8IFRlbXBsYXRlTm9kZVtdfSBmcmFnbWVudFxuICogQHBhcmFtIHtib29sZWFufSBpc190ZXh0XG4gKiBAcmV0dXJucyB7Tm9kZSB8IG51bGx9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmaXJzdF9jaGlsZChmcmFnbWVudCwgaXNfdGV4dCkge1xuXHRpZiAoIWh5ZHJhdGluZykge1xuXHRcdC8vIHdoZW4gbm90IGh5ZHJhdGluZywgYGZyYWdtZW50YCBpcyBhIGBEb2N1bWVudEZyYWdtZW50YCAodGhlIHJlc3VsdCBvZiBjYWxsaW5nIGBvcGVuX2ZyYWdgKVxuXHRcdHZhciBmaXJzdCA9IC8qKiBAdHlwZSB7RG9jdW1lbnRGcmFnbWVudH0gKi8gKGdldF9maXJzdF9jaGlsZCgvKiogQHR5cGUge05vZGV9ICovIChmcmFnbWVudCkpKTtcblxuXHRcdC8vIFRPRE8gcHJldmVudCB1c2VyIGNvbW1lbnRzIHdpdGggdGhlIGVtcHR5IHN0cmluZyB3aGVuIHByZXNlcnZlQ29tbWVudHMgaXMgdHJ1ZVxuXHRcdGlmIChmaXJzdCBpbnN0YW5jZW9mIENvbW1lbnQgJiYgZmlyc3QuZGF0YSA9PT0gJycpIHJldHVybiBnZXRfbmV4dF9zaWJsaW5nKGZpcnN0KTtcblxuXHRcdHJldHVybiBmaXJzdDtcblx0fVxuXG5cdC8vIGlmIGFuIHtleHByZXNzaW9ufSBpcyBlbXB0eSBkdXJpbmcgU1NSLCB0aGVyZSBtaWdodCBiZSBub1xuXHQvLyB0ZXh0IG5vZGUgdG8gaHlkcmF0ZSDigJQgd2UgbXVzdCB0aGVyZWZvcmUgY3JlYXRlIG9uZVxuXHRpZiAoaXNfdGV4dCAmJiBoeWRyYXRlX25vZGU/Lm5vZGVUeXBlICE9PSAzKSB7XG5cdFx0dmFyIHRleHQgPSBjcmVhdGVfdGV4dCgpO1xuXG5cdFx0aHlkcmF0ZV9ub2RlPy5iZWZvcmUodGV4dCk7XG5cdFx0c2V0X2h5ZHJhdGVfbm9kZSh0ZXh0KTtcblx0XHRyZXR1cm4gdGV4dDtcblx0fVxuXG5cdHJldHVybiBoeWRyYXRlX25vZGU7XG59XG5cbi8qKlxuICogRG9uJ3QgbWFyayB0aGlzIGFzIHNpZGUtZWZmZWN0LWZyZWUsIGh5ZHJhdGlvbiBuZWVkcyB0byB3YWxrIGFsbCBub2Rlc1xuICogQHBhcmFtIHtUZW1wbGF0ZU5vZGV9IG5vZGVcbiAqIEBwYXJhbSB7bnVtYmVyfSBjb3VudFxuICogQHBhcmFtIHtib29sZWFufSBpc190ZXh0XG4gKiBAcmV0dXJucyB7Tm9kZSB8IG51bGx9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzaWJsaW5nKG5vZGUsIGNvdW50ID0gMSwgaXNfdGV4dCA9IGZhbHNlKSB7XG5cdGxldCBuZXh0X3NpYmxpbmcgPSBoeWRyYXRpbmcgPyBoeWRyYXRlX25vZGUgOiBub2RlO1xuXHR2YXIgbGFzdF9zaWJsaW5nO1xuXG5cdHdoaWxlIChjb3VudC0tKSB7XG5cdFx0bGFzdF9zaWJsaW5nID0gbmV4dF9zaWJsaW5nO1xuXHRcdG5leHRfc2libGluZyA9IC8qKiBAdHlwZSB7VGVtcGxhdGVOb2RlfSAqLyAoZ2V0X25leHRfc2libGluZyhuZXh0X3NpYmxpbmcpKTtcblx0fVxuXG5cdGlmICghaHlkcmF0aW5nKSB7XG5cdFx0cmV0dXJuIG5leHRfc2libGluZztcblx0fVxuXG5cdHZhciB0eXBlID0gbmV4dF9zaWJsaW5nPy5ub2RlVHlwZTtcblxuXHQvLyBpZiBhIHNpYmxpbmcge2V4cHJlc3Npb259IGlzIGVtcHR5IGR1cmluZyBTU1IsIHRoZXJlIG1pZ2h0IGJlIG5vXG5cdC8vIHRleHQgbm9kZSB0byBoeWRyYXRlIOKAlCB3ZSBtdXN0IHRoZXJlZm9yZSBjcmVhdGUgb25lXG5cdGlmIChpc190ZXh0ICYmIHR5cGUgIT09IDMpIHtcblx0XHR2YXIgdGV4dCA9IGNyZWF0ZV90ZXh0KCk7XG5cdFx0Ly8gSWYgdGhlIG5leHQgc2libGluZyBpcyBgbnVsbGAgYW5kIHdlJ3JlIGhhbmRsaW5nIHRleHQgdGhlbiBpdCdzIGJlY2F1c2Vcblx0XHQvLyB0aGUgU1NSIGNvbnRlbnQgd2FzIGVtcHR5IGZvciB0aGUgdGV4dCwgc28gd2UgbmVlZCB0byBnZW5lcmF0ZSBhIG5ldyB0ZXh0XG5cdFx0Ly8gbm9kZSBhbmQgaW5zZXJ0IGl0IGFmdGVyIHRoZSBsYXN0IHNpYmxpbmdcblx0XHRpZiAobmV4dF9zaWJsaW5nID09PSBudWxsKSB7XG5cdFx0XHRsYXN0X3NpYmxpbmc/LmFmdGVyKHRleHQpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRuZXh0X3NpYmxpbmcuYmVmb3JlKHRleHQpO1xuXHRcdH1cblx0XHRzZXRfaHlkcmF0ZV9ub2RlKHRleHQpO1xuXHRcdHJldHVybiB0ZXh0O1xuXHR9XG5cblx0c2V0X2h5ZHJhdGVfbm9kZShuZXh0X3NpYmxpbmcpO1xuXHRyZXR1cm4gLyoqIEB0eXBlIHtUZW1wbGF0ZU5vZGV9ICovIChuZXh0X3NpYmxpbmcpO1xufVxuXG4vKipcbiAqIEB0ZW1wbGF0ZSB7Tm9kZX0gTlxuICogQHBhcmFtIHtOfSBub2RlXG4gKiBAcmV0dXJucyB7dm9pZH1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNsZWFyX3RleHRfY29udGVudChub2RlKSB7XG5cdG5vZGUudGV4dENvbnRlbnQgPSAnJztcbn1cbiIsIi8qKiBAaW1wb3J0IHsgRGVyaXZlZCwgRWZmZWN0IH0gZnJvbSAnI2NsaWVudCcgKi9cbmltcG9ydCB7IERFViB9IGZyb20gJ2VzbS1lbnYnO1xuaW1wb3J0IHtcblx0Q0xFQU4sXG5cdERFUklWRUQsXG5cdERFU1RST1lFRCxcblx0RElSVFksXG5cdEVGRkVDVF9IQVNfREVSSVZFRCxcblx0TUFZQkVfRElSVFksXG5cdFVOT1dORURcbn0gZnJvbSAnLi4vY29uc3RhbnRzLmpzJztcbmltcG9ydCB7XG5cdGFjdGl2ZV9yZWFjdGlvbixcblx0YWN0aXZlX2VmZmVjdCxcblx0cmVtb3ZlX3JlYWN0aW9ucyxcblx0c2V0X3NpZ25hbF9zdGF0dXMsXG5cdHNraXBfcmVhY3Rpb24sXG5cdHVwZGF0ZV9yZWFjdGlvbixcblx0aW5jcmVtZW50X3ZlcnNpb24sXG5cdHNldF9hY3RpdmVfZWZmZWN0LFxuXHRjb21wb25lbnRfY29udGV4dFxufSBmcm9tICcuLi9ydW50aW1lLmpzJztcbmltcG9ydCB7IGVxdWFscywgc2FmZV9lcXVhbHMgfSBmcm9tICcuL2VxdWFsaXR5LmpzJztcbmltcG9ydCAqIGFzIGUgZnJvbSAnLi4vZXJyb3JzLmpzJztcbmltcG9ydCB7IGRlc3Ryb3lfZWZmZWN0IH0gZnJvbSAnLi9lZmZlY3RzLmpzJztcbmltcG9ydCB7IGluc3BlY3RfZWZmZWN0cywgc2V0X2luc3BlY3RfZWZmZWN0cyB9IGZyb20gJy4vc291cmNlcy5qcyc7XG5pbXBvcnQgeyBnZXRfc3RhY2sgfSBmcm9tICcuLi9kZXYvdHJhY2luZy5qcyc7XG5pbXBvcnQgeyB0cmFjaW5nX21vZGVfZmxhZyB9IGZyb20gJy4uLy4uL2ZsYWdzL2luZGV4LmpzJztcblxuLyoqXG4gKiBAdGVtcGxhdGUgVlxuICogQHBhcmFtIHsoKSA9PiBWfSBmblxuICogQHJldHVybnMge0Rlcml2ZWQ8Vj59XG4gKi9cbi8qI19fTk9fU0lERV9FRkZFQ1RTX18qL1xuZXhwb3J0IGZ1bmN0aW9uIGRlcml2ZWQoZm4pIHtcblx0dmFyIGZsYWdzID0gREVSSVZFRCB8IERJUlRZO1xuXG5cdGlmIChhY3RpdmVfZWZmZWN0ID09PSBudWxsKSB7XG5cdFx0ZmxhZ3MgfD0gVU5PV05FRDtcblx0fSBlbHNlIHtcblx0XHQvLyBTaW5jZSBkZXJpdmVkcyBhcmUgZXZhbHVhdGVkIGxhemlseSwgYW55IGVmZmVjdHMgY3JlYXRlZCBpbnNpZGUgdGhlbSBhcmVcblx0XHQvLyBjcmVhdGVkIHRvbyBsYXRlIHRvIGVuc3VyZSB0aGF0IHRoZSBwYXJlbnQgZWZmZWN0IGlzIGFkZGVkIHRvIHRoZSB0cmVlXG5cdFx0YWN0aXZlX2VmZmVjdC5mIHw9IEVGRkVDVF9IQVNfREVSSVZFRDtcblx0fVxuXG5cdHZhciBwYXJlbnRfZGVyaXZlZCA9XG5cdFx0YWN0aXZlX3JlYWN0aW9uICE9PSBudWxsICYmIChhY3RpdmVfcmVhY3Rpb24uZiAmIERFUklWRUQpICE9PSAwXG5cdFx0XHQ/IC8qKiBAdHlwZSB7RGVyaXZlZH0gKi8gKGFjdGl2ZV9yZWFjdGlvbilcblx0XHRcdDogbnVsbDtcblxuXHQvKiogQHR5cGUge0Rlcml2ZWQ8Vj59ICovXG5cdGNvbnN0IHNpZ25hbCA9IHtcblx0XHRjaGlsZHJlbjogbnVsbCxcblx0XHRjdHg6IGNvbXBvbmVudF9jb250ZXh0LFxuXHRcdGRlcHM6IG51bGwsXG5cdFx0ZXF1YWxzLFxuXHRcdGY6IGZsYWdzLFxuXHRcdGZuLFxuXHRcdHJlYWN0aW9uczogbnVsbCxcblx0XHR2OiAvKiogQHR5cGUge1Z9ICovIChudWxsKSxcblx0XHR2ZXJzaW9uOiAwLFxuXHRcdHBhcmVudDogcGFyZW50X2Rlcml2ZWQgPz8gYWN0aXZlX2VmZmVjdFxuXHR9O1xuXG5cdGlmIChERVYgJiYgdHJhY2luZ19tb2RlX2ZsYWcpIHtcblx0XHRzaWduYWwuY3JlYXRlZCA9IGdldF9zdGFjaygnQ3JlYXRlZEF0Jyk7XG5cdH1cblxuXHRpZiAocGFyZW50X2Rlcml2ZWQgIT09IG51bGwpIHtcblx0XHQocGFyZW50X2Rlcml2ZWQuY2hpbGRyZW4gPz89IFtdKS5wdXNoKHNpZ25hbCk7XG5cdH1cblxuXHRyZXR1cm4gc2lnbmFsO1xufVxuXG4vKipcbiAqIEB0ZW1wbGF0ZSBWXG4gKiBAcGFyYW0geygpID0+IFZ9IGZuXG4gKiBAcmV0dXJucyB7RGVyaXZlZDxWPn1cbiAqL1xuLyojX19OT19TSURFX0VGRkVDVFNfXyovXG5leHBvcnQgZnVuY3Rpb24gZGVyaXZlZF9zYWZlX2VxdWFsKGZuKSB7XG5cdGNvbnN0IHNpZ25hbCA9IGRlcml2ZWQoZm4pO1xuXHRzaWduYWwuZXF1YWxzID0gc2FmZV9lcXVhbHM7XG5cdHJldHVybiBzaWduYWw7XG59XG5cbi8qKlxuICogQHBhcmFtIHtEZXJpdmVkfSBkZXJpdmVkXG4gKiBAcmV0dXJucyB7dm9pZH1cbiAqL1xuZnVuY3Rpb24gZGVzdHJveV9kZXJpdmVkX2NoaWxkcmVuKGRlcml2ZWQpIHtcblx0dmFyIGNoaWxkcmVuID0gZGVyaXZlZC5jaGlsZHJlbjtcblxuXHRpZiAoY2hpbGRyZW4gIT09IG51bGwpIHtcblx0XHRkZXJpdmVkLmNoaWxkcmVuID0gbnVsbDtcblxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpICs9IDEpIHtcblx0XHRcdHZhciBjaGlsZCA9IGNoaWxkcmVuW2ldO1xuXHRcdFx0aWYgKChjaGlsZC5mICYgREVSSVZFRCkgIT09IDApIHtcblx0XHRcdFx0ZGVzdHJveV9kZXJpdmVkKC8qKiBAdHlwZSB7RGVyaXZlZH0gKi8gKGNoaWxkKSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRkZXN0cm95X2VmZmVjdCgvKiogQHR5cGUge0VmZmVjdH0gKi8gKGNoaWxkKSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG59XG5cbi8qKlxuICogVGhlIGN1cnJlbnRseSB1cGRhdGluZyBkZXJpdmVkcywgdXNlZCB0byBkZXRlY3QgaW5maW5pdGUgcmVjdXJzaW9uXG4gKiBpbiBkZXYgbW9kZSBhbmQgcHJvdmlkZSBhIG5pY2VyIGVycm9yIHRoYW4gJ3RvbyBtdWNoIHJlY3Vyc2lvbidcbiAqIEB0eXBlIHtEZXJpdmVkW119XG4gKi9cbmxldCBzdGFjayA9IFtdO1xuXG4vKipcbiAqIEBwYXJhbSB7RGVyaXZlZH0gZGVyaXZlZFxuICogQHJldHVybnMge0VmZmVjdCB8IG51bGx9XG4gKi9cbmZ1bmN0aW9uIGdldF9kZXJpdmVkX3BhcmVudF9lZmZlY3QoZGVyaXZlZCkge1xuXHR2YXIgcGFyZW50ID0gZGVyaXZlZC5wYXJlbnQ7XG5cdHdoaWxlIChwYXJlbnQgIT09IG51bGwpIHtcblx0XHRpZiAoKHBhcmVudC5mICYgREVSSVZFRCkgPT09IDApIHtcblx0XHRcdHJldHVybiAvKiogQHR5cGUge0VmZmVjdH0gKi8gKHBhcmVudCk7XG5cdFx0fVxuXHRcdHBhcmVudCA9IHBhcmVudC5wYXJlbnQ7XG5cdH1cblx0cmV0dXJuIG51bGw7XG59XG5cbi8qKlxuICogQHRlbXBsYXRlIFRcbiAqIEBwYXJhbSB7RGVyaXZlZH0gZGVyaXZlZFxuICogQHJldHVybnMge1R9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBleGVjdXRlX2Rlcml2ZWQoZGVyaXZlZCkge1xuXHR2YXIgdmFsdWU7XG5cdHZhciBwcmV2X2FjdGl2ZV9lZmZlY3QgPSBhY3RpdmVfZWZmZWN0O1xuXG5cdHNldF9hY3RpdmVfZWZmZWN0KGdldF9kZXJpdmVkX3BhcmVudF9lZmZlY3QoZGVyaXZlZCkpO1xuXG5cdGlmIChERVYpIHtcblx0XHRsZXQgcHJldl9pbnNwZWN0X2VmZmVjdHMgPSBpbnNwZWN0X2VmZmVjdHM7XG5cdFx0c2V0X2luc3BlY3RfZWZmZWN0cyhuZXcgU2V0KCkpO1xuXHRcdHRyeSB7XG5cdFx0XHRpZiAoc3RhY2suaW5jbHVkZXMoZGVyaXZlZCkpIHtcblx0XHRcdFx0ZS5kZXJpdmVkX3JlZmVyZW5jZXNfc2VsZigpO1xuXHRcdFx0fVxuXG5cdFx0XHRzdGFjay5wdXNoKGRlcml2ZWQpO1xuXG5cdFx0XHRkZXN0cm95X2Rlcml2ZWRfY2hpbGRyZW4oZGVyaXZlZCk7XG5cdFx0XHR2YWx1ZSA9IHVwZGF0ZV9yZWFjdGlvbihkZXJpdmVkKTtcblx0XHR9IGZpbmFsbHkge1xuXHRcdFx0c2V0X2FjdGl2ZV9lZmZlY3QocHJldl9hY3RpdmVfZWZmZWN0KTtcblx0XHRcdHNldF9pbnNwZWN0X2VmZmVjdHMocHJldl9pbnNwZWN0X2VmZmVjdHMpO1xuXHRcdFx0c3RhY2sucG9wKCk7XG5cdFx0fVxuXHR9IGVsc2Uge1xuXHRcdHRyeSB7XG5cdFx0XHRkZXN0cm95X2Rlcml2ZWRfY2hpbGRyZW4oZGVyaXZlZCk7XG5cdFx0XHR2YWx1ZSA9IHVwZGF0ZV9yZWFjdGlvbihkZXJpdmVkKTtcblx0XHR9IGZpbmFsbHkge1xuXHRcdFx0c2V0X2FjdGl2ZV9lZmZlY3QocHJldl9hY3RpdmVfZWZmZWN0KTtcblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gdmFsdWU7XG59XG5cbi8qKlxuICogQHBhcmFtIHtEZXJpdmVkfSBkZXJpdmVkXG4gKiBAcmV0dXJucyB7dm9pZH1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHVwZGF0ZV9kZXJpdmVkKGRlcml2ZWQpIHtcblx0dmFyIHZhbHVlID0gZXhlY3V0ZV9kZXJpdmVkKGRlcml2ZWQpO1xuXHR2YXIgc3RhdHVzID1cblx0XHQoc2tpcF9yZWFjdGlvbiB8fCAoZGVyaXZlZC5mICYgVU5PV05FRCkgIT09IDApICYmIGRlcml2ZWQuZGVwcyAhPT0gbnVsbCA/IE1BWUJFX0RJUlRZIDogQ0xFQU47XG5cblx0c2V0X3NpZ25hbF9zdGF0dXMoZGVyaXZlZCwgc3RhdHVzKTtcblxuXHRpZiAoIWRlcml2ZWQuZXF1YWxzKHZhbHVlKSkge1xuXHRcdGRlcml2ZWQudiA9IHZhbHVlO1xuXHRcdGRlcml2ZWQudmVyc2lvbiA9IGluY3JlbWVudF92ZXJzaW9uKCk7XG5cdH1cbn1cblxuLyoqXG4gKiBAcGFyYW0ge0Rlcml2ZWR9IGRlcml2ZWRcbiAqIEByZXR1cm5zIHt2b2lkfVxuICovXG5leHBvcnQgZnVuY3Rpb24gZGVzdHJveV9kZXJpdmVkKGRlcml2ZWQpIHtcblx0ZGVzdHJveV9kZXJpdmVkX2NoaWxkcmVuKGRlcml2ZWQpO1xuXHRyZW1vdmVfcmVhY3Rpb25zKGRlcml2ZWQsIDApO1xuXHRzZXRfc2lnbmFsX3N0YXR1cyhkZXJpdmVkLCBERVNUUk9ZRUQpO1xuXG5cdGRlcml2ZWQudiA9IGRlcml2ZWQuY2hpbGRyZW4gPSBkZXJpdmVkLmRlcHMgPSBkZXJpdmVkLmN0eCA9IGRlcml2ZWQucmVhY3Rpb25zID0gbnVsbDtcbn1cbiIsIi8qKiBAaW1wb3J0IHsgQ29tcG9uZW50Q29udGV4dCwgQ29tcG9uZW50Q29udGV4dExlZ2FjeSwgRGVyaXZlZCwgRWZmZWN0LCBUZW1wbGF0ZU5vZGUsIFRyYW5zaXRpb25NYW5hZ2VyIH0gZnJvbSAnI2NsaWVudCcgKi9cbmltcG9ydCB7XG5cdGNoZWNrX2RpcnRpbmVzcyxcblx0Y29tcG9uZW50X2NvbnRleHQsXG5cdGFjdGl2ZV9lZmZlY3QsXG5cdGFjdGl2ZV9yZWFjdGlvbixcblx0ZGV2X2N1cnJlbnRfY29tcG9uZW50X2Z1bmN0aW9uLFxuXHR1cGRhdGVfZWZmZWN0LFxuXHRnZXQsXG5cdGlzX2Rlc3Ryb3lpbmdfZWZmZWN0LFxuXHRpc19mbHVzaGluZ19lZmZlY3QsXG5cdHJlbW92ZV9yZWFjdGlvbnMsXG5cdHNjaGVkdWxlX2VmZmVjdCxcblx0c2V0X2FjdGl2ZV9yZWFjdGlvbixcblx0c2V0X2lzX2Rlc3Ryb3lpbmdfZWZmZWN0LFxuXHRzZXRfaXNfZmx1c2hpbmdfZWZmZWN0LFxuXHRzZXRfc2lnbmFsX3N0YXR1cyxcblx0dW50cmFjayxcblx0c2tpcF9yZWFjdGlvblxufSBmcm9tICcuLi9ydW50aW1lLmpzJztcbmltcG9ydCB7XG5cdERJUlRZLFxuXHRCUkFOQ0hfRUZGRUNULFxuXHRSRU5ERVJfRUZGRUNULFxuXHRFRkZFQ1QsXG5cdERFU1RST1lFRCxcblx0SU5FUlQsXG5cdEVGRkVDVF9SQU4sXG5cdEJMT0NLX0VGRkVDVCxcblx0Uk9PVF9FRkZFQ1QsXG5cdEVGRkVDVF9UUkFOU1BBUkVOVCxcblx0REVSSVZFRCxcblx0VU5PV05FRCxcblx0Q0xFQU4sXG5cdElOU1BFQ1RfRUZGRUNULFxuXHRIRUFEX0VGRkVDVCxcblx0TUFZQkVfRElSVFksXG5cdEVGRkVDVF9IQVNfREVSSVZFRFxufSBmcm9tICcuLi9jb25zdGFudHMuanMnO1xuaW1wb3J0IHsgc2V0IH0gZnJvbSAnLi9zb3VyY2VzLmpzJztcbmltcG9ydCAqIGFzIGUgZnJvbSAnLi4vZXJyb3JzLmpzJztcbmltcG9ydCB7IERFViB9IGZyb20gJ2VzbS1lbnYnO1xuaW1wb3J0IHsgZGVmaW5lX3Byb3BlcnR5IH0gZnJvbSAnLi4vLi4vc2hhcmVkL3V0aWxzLmpzJztcbmltcG9ydCB7IGdldF9uZXh0X3NpYmxpbmcgfSBmcm9tICcuLi9kb20vb3BlcmF0aW9ucy5qcyc7XG5pbXBvcnQgeyBkZXN0cm95X2Rlcml2ZWQgfSBmcm9tICcuL2Rlcml2ZWRzLmpzJztcblxuLyoqXG4gKiBAcGFyYW0geyckZWZmZWN0JyB8ICckZWZmZWN0LnByZScgfCAnJGluc3BlY3QnfSBydW5lXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZV9lZmZlY3QocnVuZSkge1xuXHRpZiAoYWN0aXZlX2VmZmVjdCA9PT0gbnVsbCAmJiBhY3RpdmVfcmVhY3Rpb24gPT09IG51bGwpIHtcblx0XHRlLmVmZmVjdF9vcnBoYW4ocnVuZSk7XG5cdH1cblxuXHRpZiAoYWN0aXZlX3JlYWN0aW9uICE9PSBudWxsICYmIChhY3RpdmVfcmVhY3Rpb24uZiAmIFVOT1dORUQpICE9PSAwKSB7XG5cdFx0ZS5lZmZlY3RfaW5fdW5vd25lZF9kZXJpdmVkKCk7XG5cdH1cblxuXHRpZiAoaXNfZGVzdHJveWluZ19lZmZlY3QpIHtcblx0XHRlLmVmZmVjdF9pbl90ZWFyZG93bihydW5lKTtcblx0fVxufVxuXG4vKipcbiAqIEBwYXJhbSB7RWZmZWN0fSBlZmZlY3RcbiAqIEBwYXJhbSB7RWZmZWN0fSBwYXJlbnRfZWZmZWN0XG4gKi9cbmZ1bmN0aW9uIHB1c2hfZWZmZWN0KGVmZmVjdCwgcGFyZW50X2VmZmVjdCkge1xuXHR2YXIgcGFyZW50X2xhc3QgPSBwYXJlbnRfZWZmZWN0Lmxhc3Q7XG5cdGlmIChwYXJlbnRfbGFzdCA9PT0gbnVsbCkge1xuXHRcdHBhcmVudF9lZmZlY3QubGFzdCA9IHBhcmVudF9lZmZlY3QuZmlyc3QgPSBlZmZlY3Q7XG5cdH0gZWxzZSB7XG5cdFx0cGFyZW50X2xhc3QubmV4dCA9IGVmZmVjdDtcblx0XHRlZmZlY3QucHJldiA9IHBhcmVudF9sYXN0O1xuXHRcdHBhcmVudF9lZmZlY3QubGFzdCA9IGVmZmVjdDtcblx0fVxufVxuXG4vKipcbiAqIEBwYXJhbSB7bnVtYmVyfSB0eXBlXG4gKiBAcGFyYW0ge251bGwgfCAoKCkgPT4gdm9pZCB8ICgoKSA9PiB2b2lkKSl9IGZuXG4gKiBAcGFyYW0ge2Jvb2xlYW59IHN5bmNcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gcHVzaFxuICogQHJldHVybnMge0VmZmVjdH1cbiAqL1xuZnVuY3Rpb24gY3JlYXRlX2VmZmVjdCh0eXBlLCBmbiwgc3luYywgcHVzaCA9IHRydWUpIHtcblx0dmFyIGlzX3Jvb3QgPSAodHlwZSAmIFJPT1RfRUZGRUNUKSAhPT0gMDtcblx0dmFyIHBhcmVudF9lZmZlY3QgPSBhY3RpdmVfZWZmZWN0O1xuXG5cdGlmIChERVYpIHtcblx0XHQvLyBFbnN1cmUgdGhlIHBhcmVudCBpcyBuZXZlciBhbiBpbnNwZWN0IGVmZmVjdFxuXHRcdHdoaWxlIChwYXJlbnRfZWZmZWN0ICE9PSBudWxsICYmIChwYXJlbnRfZWZmZWN0LmYgJiBJTlNQRUNUX0VGRkVDVCkgIT09IDApIHtcblx0XHRcdHBhcmVudF9lZmZlY3QgPSBwYXJlbnRfZWZmZWN0LnBhcmVudDtcblx0XHR9XG5cdH1cblxuXHQvKiogQHR5cGUge0VmZmVjdH0gKi9cblx0dmFyIGVmZmVjdCA9IHtcblx0XHRjdHg6IGNvbXBvbmVudF9jb250ZXh0LFxuXHRcdGRlcHM6IG51bGwsXG5cdFx0ZGVyaXZlZHM6IG51bGwsXG5cdFx0bm9kZXNfc3RhcnQ6IG51bGwsXG5cdFx0bm9kZXNfZW5kOiBudWxsLFxuXHRcdGY6IHR5cGUgfCBESVJUWSxcblx0XHRmaXJzdDogbnVsbCxcblx0XHRmbixcblx0XHRsYXN0OiBudWxsLFxuXHRcdG5leHQ6IG51bGwsXG5cdFx0cGFyZW50OiBpc19yb290ID8gbnVsbCA6IHBhcmVudF9lZmZlY3QsXG5cdFx0cHJldjogbnVsbCxcblx0XHR0ZWFyZG93bjogbnVsbCxcblx0XHR0cmFuc2l0aW9uczogbnVsbCxcblx0XHR2ZXJzaW9uOiAwXG5cdH07XG5cblx0aWYgKERFVikge1xuXHRcdGVmZmVjdC5jb21wb25lbnRfZnVuY3Rpb24gPSBkZXZfY3VycmVudF9jb21wb25lbnRfZnVuY3Rpb247XG5cdH1cblxuXHRpZiAoc3luYykge1xuXHRcdHZhciBwcmV2aW91c2x5X2ZsdXNoaW5nX2VmZmVjdCA9IGlzX2ZsdXNoaW5nX2VmZmVjdDtcblxuXHRcdHRyeSB7XG5cdFx0XHRzZXRfaXNfZmx1c2hpbmdfZWZmZWN0KHRydWUpO1xuXHRcdFx0dXBkYXRlX2VmZmVjdChlZmZlY3QpO1xuXHRcdFx0ZWZmZWN0LmYgfD0gRUZGRUNUX1JBTjtcblx0XHR9IGNhdGNoIChlKSB7XG5cdFx0XHRkZXN0cm95X2VmZmVjdChlZmZlY3QpO1xuXHRcdFx0dGhyb3cgZTtcblx0XHR9IGZpbmFsbHkge1xuXHRcdFx0c2V0X2lzX2ZsdXNoaW5nX2VmZmVjdChwcmV2aW91c2x5X2ZsdXNoaW5nX2VmZmVjdCk7XG5cdFx0fVxuXHR9IGVsc2UgaWYgKGZuICE9PSBudWxsKSB7XG5cdFx0c2NoZWR1bGVfZWZmZWN0KGVmZmVjdCk7XG5cdH1cblxuXHQvLyBpZiBhbiBlZmZlY3QgaGFzIG5vIGRlcGVuZGVuY2llcywgbm8gRE9NIGFuZCBubyB0ZWFyZG93biBmdW5jdGlvbixcblx0Ly8gZG9uJ3QgYm90aGVyIGFkZGluZyBpdCB0byB0aGUgZWZmZWN0IHRyZWVcblx0dmFyIGluZXJ0ID1cblx0XHRzeW5jICYmXG5cdFx0ZWZmZWN0LmRlcHMgPT09IG51bGwgJiZcblx0XHRlZmZlY3QuZmlyc3QgPT09IG51bGwgJiZcblx0XHRlZmZlY3Qubm9kZXNfc3RhcnQgPT09IG51bGwgJiZcblx0XHRlZmZlY3QudGVhcmRvd24gPT09IG51bGwgJiZcblx0XHQoZWZmZWN0LmYgJiBFRkZFQ1RfSEFTX0RFUklWRUQpID09PSAwO1xuXG5cdGlmICghaW5lcnQgJiYgIWlzX3Jvb3QgJiYgcHVzaCkge1xuXHRcdGlmIChwYXJlbnRfZWZmZWN0ICE9PSBudWxsKSB7XG5cdFx0XHRwdXNoX2VmZmVjdChlZmZlY3QsIHBhcmVudF9lZmZlY3QpO1xuXHRcdH1cblxuXHRcdC8vIGlmIHdlJ3JlIGluIGEgZGVyaXZlZCwgYWRkIHRoZSBlZmZlY3QgdGhlcmUgdG9vXG5cdFx0aWYgKGFjdGl2ZV9yZWFjdGlvbiAhPT0gbnVsbCAmJiAoYWN0aXZlX3JlYWN0aW9uLmYgJiBERVJJVkVEKSAhPT0gMCkge1xuXHRcdFx0dmFyIGRlcml2ZWQgPSAvKiogQHR5cGUge0Rlcml2ZWR9ICovIChhY3RpdmVfcmVhY3Rpb24pO1xuXHRcdFx0KGRlcml2ZWQuY2hpbGRyZW4gPz89IFtdKS5wdXNoKGVmZmVjdCk7XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIGVmZmVjdDtcbn1cblxuLyoqXG4gKiBJbnRlcm5hbCByZXByZXNlbnRhdGlvbiBvZiBgJGVmZmVjdC50cmFja2luZygpYFxuICogQHJldHVybnMge2Jvb2xlYW59XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBlZmZlY3RfdHJhY2tpbmcoKSB7XG5cdGlmIChhY3RpdmVfcmVhY3Rpb24gPT09IG51bGwpIHtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHQvLyBJZiBpdCdzIHNraXBwZWQsIHRoYXQncyBiZWNhdXNlIHdlJ3JlIGluc2lkZSBhbiB1bm93bmVkXG5cdC8vIHRoYXQgaXMgbm90IGJlaW5nIHRyYWNrZWQgYnkgYW5vdGhlciByZWFjdGlvblxuXHRyZXR1cm4gIXNraXBfcmVhY3Rpb247XG59XG5cbi8qKlxuICogQHBhcmFtIHsoKSA9PiB2b2lkfSBmblxuICovXG5leHBvcnQgZnVuY3Rpb24gdGVhcmRvd24oZm4pIHtcblx0Y29uc3QgZWZmZWN0ID0gY3JlYXRlX2VmZmVjdChSRU5ERVJfRUZGRUNULCBudWxsLCBmYWxzZSk7XG5cdHNldF9zaWduYWxfc3RhdHVzKGVmZmVjdCwgQ0xFQU4pO1xuXHRlZmZlY3QudGVhcmRvd24gPSBmbjtcblx0cmV0dXJuIGVmZmVjdDtcbn1cblxuLyoqXG4gKiBJbnRlcm5hbCByZXByZXNlbnRhdGlvbiBvZiBgJGVmZmVjdCguLi4pYFxuICogQHBhcmFtIHsoKSA9PiB2b2lkIHwgKCgpID0+IHZvaWQpfSBmblxuICovXG5leHBvcnQgZnVuY3Rpb24gdXNlcl9lZmZlY3QoZm4pIHtcblx0dmFsaWRhdGVfZWZmZWN0KCckZWZmZWN0Jyk7XG5cblx0Ly8gTm9uLW5lc3RlZCBgJGVmZmVjdCguLi4pYCBpbiBhIGNvbXBvbmVudCBzaG91bGQgYmUgZGVmZXJyZWRcblx0Ly8gdW50aWwgdGhlIGNvbXBvbmVudCBpcyBtb3VudGVkXG5cdHZhciBkZWZlciA9XG5cdFx0YWN0aXZlX2VmZmVjdCAhPT0gbnVsbCAmJlxuXHRcdChhY3RpdmVfZWZmZWN0LmYgJiBCUkFOQ0hfRUZGRUNUKSAhPT0gMCAmJlxuXHRcdGNvbXBvbmVudF9jb250ZXh0ICE9PSBudWxsICYmXG5cdFx0IWNvbXBvbmVudF9jb250ZXh0Lm07XG5cblx0aWYgKERFVikge1xuXHRcdGRlZmluZV9wcm9wZXJ0eShmbiwgJ25hbWUnLCB7XG5cdFx0XHR2YWx1ZTogJyRlZmZlY3QnXG5cdFx0fSk7XG5cdH1cblxuXHRpZiAoZGVmZXIpIHtcblx0XHR2YXIgY29udGV4dCA9IC8qKiBAdHlwZSB7Q29tcG9uZW50Q29udGV4dH0gKi8gKGNvbXBvbmVudF9jb250ZXh0KTtcblx0XHQoY29udGV4dC5lID8/PSBbXSkucHVzaCh7XG5cdFx0XHRmbixcblx0XHRcdGVmZmVjdDogYWN0aXZlX2VmZmVjdCxcblx0XHRcdHJlYWN0aW9uOiBhY3RpdmVfcmVhY3Rpb25cblx0XHR9KTtcblx0fSBlbHNlIHtcblx0XHR2YXIgc2lnbmFsID0gZWZmZWN0KGZuKTtcblx0XHRyZXR1cm4gc2lnbmFsO1xuXHR9XG59XG5cbi8qKlxuICogSW50ZXJuYWwgcmVwcmVzZW50YXRpb24gb2YgYCRlZmZlY3QucHJlKC4uLilgXG4gKiBAcGFyYW0geygpID0+IHZvaWQgfCAoKCkgPT4gdm9pZCl9IGZuXG4gKiBAcmV0dXJucyB7RWZmZWN0fVxuICovXG5leHBvcnQgZnVuY3Rpb24gdXNlcl9wcmVfZWZmZWN0KGZuKSB7XG5cdHZhbGlkYXRlX2VmZmVjdCgnJGVmZmVjdC5wcmUnKTtcblx0aWYgKERFVikge1xuXHRcdGRlZmluZV9wcm9wZXJ0eShmbiwgJ25hbWUnLCB7XG5cdFx0XHR2YWx1ZTogJyRlZmZlY3QucHJlJ1xuXHRcdH0pO1xuXHR9XG5cdHJldHVybiByZW5kZXJfZWZmZWN0KGZuKTtcbn1cblxuLyoqIEBwYXJhbSB7KCkgPT4gdm9pZCB8ICgoKSA9PiB2b2lkKX0gZm4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpbnNwZWN0X2VmZmVjdChmbikge1xuXHRyZXR1cm4gY3JlYXRlX2VmZmVjdChJTlNQRUNUX0VGRkVDVCwgZm4sIHRydWUpO1xufVxuXG4vKipcbiAqIEludGVybmFsIHJlcHJlc2VudGF0aW9uIG9mIGAkZWZmZWN0LnJvb3QoLi4uKWBcbiAqIEBwYXJhbSB7KCkgPT4gdm9pZCB8ICgoKSA9PiB2b2lkKX0gZm5cbiAqIEByZXR1cm5zIHsoKSA9PiB2b2lkfVxuICovXG5leHBvcnQgZnVuY3Rpb24gZWZmZWN0X3Jvb3QoZm4pIHtcblx0Y29uc3QgZWZmZWN0ID0gY3JlYXRlX2VmZmVjdChST09UX0VGRkVDVCwgZm4sIHRydWUpO1xuXG5cdHJldHVybiAoKSA9PiB7XG5cdFx0ZGVzdHJveV9lZmZlY3QoZWZmZWN0KTtcblx0fTtcbn1cblxuLyoqXG4gKiBBbiBlZmZlY3Qgcm9vdCB3aG9zZSBjaGlsZHJlbiBjYW4gdHJhbnNpdGlvbiBvdXRcbiAqIEBwYXJhbSB7KCkgPT4gdm9pZH0gZm5cbiAqIEByZXR1cm5zIHsob3B0aW9ucz86IHsgb3V0cm8/OiBib29sZWFuIH0pID0+IFByb21pc2U8dm9pZD59XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb21wb25lbnRfcm9vdChmbikge1xuXHRjb25zdCBlZmZlY3QgPSBjcmVhdGVfZWZmZWN0KFJPT1RfRUZGRUNULCBmbiwgdHJ1ZSk7XG5cblx0cmV0dXJuIChvcHRpb25zID0ge30pID0+IHtcblx0XHRyZXR1cm4gbmV3IFByb21pc2UoKGZ1bGZpbCkgPT4ge1xuXHRcdFx0aWYgKG9wdGlvbnMub3V0cm8pIHtcblx0XHRcdFx0cGF1c2VfZWZmZWN0KGVmZmVjdCwgKCkgPT4ge1xuXHRcdFx0XHRcdGRlc3Ryb3lfZWZmZWN0KGVmZmVjdCk7XG5cdFx0XHRcdFx0ZnVsZmlsKHVuZGVmaW5lZCk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0ZGVzdHJveV9lZmZlY3QoZWZmZWN0KTtcblx0XHRcdFx0ZnVsZmlsKHVuZGVmaW5lZCk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH07XG59XG5cbi8qKlxuICogQHBhcmFtIHsoKSA9PiB2b2lkIHwgKCgpID0+IHZvaWQpfSBmblxuICogQHJldHVybnMge0VmZmVjdH1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGVmZmVjdChmbikge1xuXHRyZXR1cm4gY3JlYXRlX2VmZmVjdChFRkZFQ1QsIGZuLCBmYWxzZSk7XG59XG5cbi8qKlxuICogSW50ZXJuYWwgcmVwcmVzZW50YXRpb24gb2YgYCQ6IC4uYFxuICogQHBhcmFtIHsoKSA9PiBhbnl9IGRlcHNcbiAqIEBwYXJhbSB7KCkgPT4gdm9pZCB8ICgoKSA9PiB2b2lkKX0gZm5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxlZ2FjeV9wcmVfZWZmZWN0KGRlcHMsIGZuKSB7XG5cdHZhciBjb250ZXh0ID0gLyoqIEB0eXBlIHtDb21wb25lbnRDb250ZXh0TGVnYWN5fSAqLyAoY29tcG9uZW50X2NvbnRleHQpO1xuXG5cdC8qKiBAdHlwZSB7eyBlZmZlY3Q6IG51bGwgfCBFZmZlY3QsIHJhbjogYm9vbGVhbiB9fSAqL1xuXHR2YXIgdG9rZW4gPSB7IGVmZmVjdDogbnVsbCwgcmFuOiBmYWxzZSB9O1xuXHRjb250ZXh0LmwucjEucHVzaCh0b2tlbik7XG5cblx0dG9rZW4uZWZmZWN0ID0gcmVuZGVyX2VmZmVjdCgoKSA9PiB7XG5cdFx0ZGVwcygpO1xuXG5cdFx0Ly8gSWYgdGhpcyBsZWdhY3kgcHJlIGVmZmVjdCBoYXMgYWxyZWFkeSBydW4gYmVmb3JlIHRoZSBlbmQgb2YgdGhlIHJlc2V0LCB0aGVuXG5cdFx0Ly8gYmFpbCBvdXQgdG8gZW11bGF0ZSB0aGUgc2FtZSBiZWhhdmlvci5cblx0XHRpZiAodG9rZW4ucmFuKSByZXR1cm47XG5cblx0XHR0b2tlbi5yYW4gPSB0cnVlO1xuXHRcdHNldChjb250ZXh0LmwucjIsIHRydWUpO1xuXHRcdHVudHJhY2soZm4pO1xuXHR9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGxlZ2FjeV9wcmVfZWZmZWN0X3Jlc2V0KCkge1xuXHR2YXIgY29udGV4dCA9IC8qKiBAdHlwZSB7Q29tcG9uZW50Q29udGV4dExlZ2FjeX0gKi8gKGNvbXBvbmVudF9jb250ZXh0KTtcblxuXHRyZW5kZXJfZWZmZWN0KCgpID0+IHtcblx0XHRpZiAoIWdldChjb250ZXh0LmwucjIpKSByZXR1cm47XG5cblx0XHQvLyBSdW4gZGlydHkgYCQ6YCBzdGF0ZW1lbnRzXG5cdFx0Zm9yICh2YXIgdG9rZW4gb2YgY29udGV4dC5sLnIxKSB7XG5cdFx0XHR2YXIgZWZmZWN0ID0gdG9rZW4uZWZmZWN0O1xuXG5cdFx0XHQvLyBJZiB0aGUgZWZmZWN0IGlzIENMRUFOLCB0aGVuIG1ha2UgaXQgTUFZQkVfRElSVFkuIFRoaXMgZW5zdXJlcyB3ZSB0cmF2ZXJzZSB0aHJvdWdoXG5cdFx0XHQvLyB0aGUgZWZmZWN0cyBkZXBlbmRlbmNpZXMgYW5kIGNvcnJlY3RseSBlbnN1cmUgZWFjaCBkZXBlbmRlbmN5IGlzIHVwLXRvLWRhdGUuXG5cdFx0XHRpZiAoKGVmZmVjdC5mICYgQ0xFQU4pICE9PSAwKSB7XG5cdFx0XHRcdHNldF9zaWduYWxfc3RhdHVzKGVmZmVjdCwgTUFZQkVfRElSVFkpO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoY2hlY2tfZGlydGluZXNzKGVmZmVjdCkpIHtcblx0XHRcdFx0dXBkYXRlX2VmZmVjdChlZmZlY3QpO1xuXHRcdFx0fVxuXG5cdFx0XHR0b2tlbi5yYW4gPSBmYWxzZTtcblx0XHR9XG5cblx0XHRjb250ZXh0LmwucjIudiA9IGZhbHNlOyAvLyBzZXQgZGlyZWN0bHkgdG8gYXZvaWQgcmVydW5uaW5nIHRoaXMgZWZmZWN0XG5cdH0pO1xufVxuXG4vKipcbiAqIEBwYXJhbSB7KCkgPT4gdm9pZCB8ICgoKSA9PiB2b2lkKX0gZm5cbiAqIEByZXR1cm5zIHtFZmZlY3R9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZW5kZXJfZWZmZWN0KGZuKSB7XG5cdHJldHVybiBjcmVhdGVfZWZmZWN0KFJFTkRFUl9FRkZFQ1QsIGZuLCB0cnVlKTtcbn1cblxuLyoqXG4gKiBAcGFyYW0geygpID0+IHZvaWQgfCAoKCkgPT4gdm9pZCl9IGZuXG4gKiBAcmV0dXJucyB7RWZmZWN0fVxuICovXG5leHBvcnQgZnVuY3Rpb24gdGVtcGxhdGVfZWZmZWN0KGZuKSB7XG5cdGlmIChERVYpIHtcblx0XHRkZWZpbmVfcHJvcGVydHkoZm4sICduYW1lJywge1xuXHRcdFx0dmFsdWU6ICd7ZXhwcmVzc2lvbn0nXG5cdFx0fSk7XG5cdH1cblx0cmV0dXJuIGJsb2NrKGZuKTtcbn1cblxuLyoqXG4gKiBAcGFyYW0geygoKSA9PiB2b2lkKX0gZm5cbiAqIEBwYXJhbSB7bnVtYmVyfSBmbGFnc1xuICovXG5leHBvcnQgZnVuY3Rpb24gYmxvY2soZm4sIGZsYWdzID0gMCkge1xuXHRyZXR1cm4gY3JlYXRlX2VmZmVjdChSRU5ERVJfRUZGRUNUIHwgQkxPQ0tfRUZGRUNUIHwgZmxhZ3MsIGZuLCB0cnVlKTtcbn1cblxuLyoqXG4gKiBAcGFyYW0geygoKSA9PiB2b2lkKX0gZm5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gW3B1c2hdXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBicmFuY2goZm4sIHB1c2ggPSB0cnVlKSB7XG5cdHJldHVybiBjcmVhdGVfZWZmZWN0KFJFTkRFUl9FRkZFQ1QgfCBCUkFOQ0hfRUZGRUNULCBmbiwgdHJ1ZSwgcHVzaCk7XG59XG5cbi8qKlxuICogQHBhcmFtIHtFZmZlY3R9IGVmZmVjdFxuICovXG5leHBvcnQgZnVuY3Rpb24gZXhlY3V0ZV9lZmZlY3RfdGVhcmRvd24oZWZmZWN0KSB7XG5cdHZhciB0ZWFyZG93biA9IGVmZmVjdC50ZWFyZG93bjtcblx0aWYgKHRlYXJkb3duICE9PSBudWxsKSB7XG5cdFx0Y29uc3QgcHJldmlvdXNseV9kZXN0cm95aW5nX2VmZmVjdCA9IGlzX2Rlc3Ryb3lpbmdfZWZmZWN0O1xuXHRcdGNvbnN0IHByZXZpb3VzX3JlYWN0aW9uID0gYWN0aXZlX3JlYWN0aW9uO1xuXHRcdHNldF9pc19kZXN0cm95aW5nX2VmZmVjdCh0cnVlKTtcblx0XHRzZXRfYWN0aXZlX3JlYWN0aW9uKG51bGwpO1xuXHRcdHRyeSB7XG5cdFx0XHR0ZWFyZG93bi5jYWxsKG51bGwpO1xuXHRcdH0gZmluYWxseSB7XG5cdFx0XHRzZXRfaXNfZGVzdHJveWluZ19lZmZlY3QocHJldmlvdXNseV9kZXN0cm95aW5nX2VmZmVjdCk7XG5cdFx0XHRzZXRfYWN0aXZlX3JlYWN0aW9uKHByZXZpb3VzX3JlYWN0aW9uKTtcblx0XHR9XG5cdH1cbn1cblxuLyoqXG4gKiBAcGFyYW0ge0VmZmVjdH0gc2lnbmFsXG4gKiBAcmV0dXJucyB7dm9pZH1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRlc3Ryb3lfZWZmZWN0X2Rlcml2ZWRzKHNpZ25hbCkge1xuXHR2YXIgZGVyaXZlZHMgPSBzaWduYWwuZGVyaXZlZHM7XG5cblx0aWYgKGRlcml2ZWRzICE9PSBudWxsKSB7XG5cdFx0c2lnbmFsLmRlcml2ZWRzID0gbnVsbDtcblxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgZGVyaXZlZHMubGVuZ3RoOyBpICs9IDEpIHtcblx0XHRcdGRlc3Ryb3lfZGVyaXZlZChkZXJpdmVkc1tpXSk7XG5cdFx0fVxuXHR9XG59XG5cbi8qKlxuICogQHBhcmFtIHtFZmZlY3R9IHNpZ25hbFxuICogQHBhcmFtIHtib29sZWFufSByZW1vdmVfZG9tXG4gKiBAcmV0dXJucyB7dm9pZH1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRlc3Ryb3lfZWZmZWN0X2NoaWxkcmVuKHNpZ25hbCwgcmVtb3ZlX2RvbSA9IGZhbHNlKSB7XG5cdHZhciBlZmZlY3QgPSBzaWduYWwuZmlyc3Q7XG5cdHNpZ25hbC5maXJzdCA9IHNpZ25hbC5sYXN0ID0gbnVsbDtcblxuXHR3aGlsZSAoZWZmZWN0ICE9PSBudWxsKSB7XG5cdFx0dmFyIG5leHQgPSBlZmZlY3QubmV4dDtcblx0XHRkZXN0cm95X2VmZmVjdChlZmZlY3QsIHJlbW92ZV9kb20pO1xuXHRcdGVmZmVjdCA9IG5leHQ7XG5cdH1cbn1cblxuLyoqXG4gKiBAcGFyYW0ge0VmZmVjdH0gc2lnbmFsXG4gKiBAcmV0dXJucyB7dm9pZH1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRlc3Ryb3lfYmxvY2tfZWZmZWN0X2NoaWxkcmVuKHNpZ25hbCkge1xuXHR2YXIgZWZmZWN0ID0gc2lnbmFsLmZpcnN0O1xuXG5cdHdoaWxlIChlZmZlY3QgIT09IG51bGwpIHtcblx0XHR2YXIgbmV4dCA9IGVmZmVjdC5uZXh0O1xuXHRcdGlmICgoZWZmZWN0LmYgJiBCUkFOQ0hfRUZGRUNUKSA9PT0gMCkge1xuXHRcdFx0ZGVzdHJveV9lZmZlY3QoZWZmZWN0KTtcblx0XHR9XG5cdFx0ZWZmZWN0ID0gbmV4dDtcblx0fVxufVxuXG4vKipcbiAqIEBwYXJhbSB7RWZmZWN0fSBlZmZlY3RcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gW3JlbW92ZV9kb21dXG4gKiBAcmV0dXJucyB7dm9pZH1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRlc3Ryb3lfZWZmZWN0KGVmZmVjdCwgcmVtb3ZlX2RvbSA9IHRydWUpIHtcblx0dmFyIHJlbW92ZWQgPSBmYWxzZTtcblxuXHRpZiAoKHJlbW92ZV9kb20gfHwgKGVmZmVjdC5mICYgSEVBRF9FRkZFQ1QpICE9PSAwKSAmJiBlZmZlY3Qubm9kZXNfc3RhcnQgIT09IG51bGwpIHtcblx0XHQvKiogQHR5cGUge1RlbXBsYXRlTm9kZSB8IG51bGx9ICovXG5cdFx0dmFyIG5vZGUgPSBlZmZlY3Qubm9kZXNfc3RhcnQ7XG5cdFx0dmFyIGVuZCA9IGVmZmVjdC5ub2Rlc19lbmQ7XG5cblx0XHR3aGlsZSAobm9kZSAhPT0gbnVsbCkge1xuXHRcdFx0LyoqIEB0eXBlIHtUZW1wbGF0ZU5vZGUgfCBudWxsfSAqL1xuXHRcdFx0dmFyIG5leHQgPSBub2RlID09PSBlbmQgPyBudWxsIDogLyoqIEB0eXBlIHtUZW1wbGF0ZU5vZGV9ICovIChnZXRfbmV4dF9zaWJsaW5nKG5vZGUpKTtcblxuXHRcdFx0bm9kZS5yZW1vdmUoKTtcblx0XHRcdG5vZGUgPSBuZXh0O1xuXHRcdH1cblxuXHRcdHJlbW92ZWQgPSB0cnVlO1xuXHR9XG5cblx0ZGVzdHJveV9lZmZlY3RfY2hpbGRyZW4oZWZmZWN0LCByZW1vdmVfZG9tICYmICFyZW1vdmVkKTtcblx0ZGVzdHJveV9lZmZlY3RfZGVyaXZlZHMoZWZmZWN0KTtcblx0cmVtb3ZlX3JlYWN0aW9ucyhlZmZlY3QsIDApO1xuXHRzZXRfc2lnbmFsX3N0YXR1cyhlZmZlY3QsIERFU1RST1lFRCk7XG5cblx0dmFyIHRyYW5zaXRpb25zID0gZWZmZWN0LnRyYW5zaXRpb25zO1xuXG5cdGlmICh0cmFuc2l0aW9ucyAhPT0gbnVsbCkge1xuXHRcdGZvciAoY29uc3QgdHJhbnNpdGlvbiBvZiB0cmFuc2l0aW9ucykge1xuXHRcdFx0dHJhbnNpdGlvbi5zdG9wKCk7XG5cdFx0fVxuXHR9XG5cblx0ZXhlY3V0ZV9lZmZlY3RfdGVhcmRvd24oZWZmZWN0KTtcblxuXHR2YXIgcGFyZW50ID0gZWZmZWN0LnBhcmVudDtcblxuXHQvLyBJZiB0aGUgcGFyZW50IGRvZXNuJ3QgaGF2ZSBhbnkgY2hpbGRyZW4sIHRoZW4gc2tpcCB0aGlzIHdvcmsgYWx0b2dldGhlclxuXHRpZiAocGFyZW50ICE9PSBudWxsICYmIHBhcmVudC5maXJzdCAhPT0gbnVsbCkge1xuXHRcdHVubGlua19lZmZlY3QoZWZmZWN0KTtcblx0fVxuXG5cdGlmIChERVYpIHtcblx0XHRlZmZlY3QuY29tcG9uZW50X2Z1bmN0aW9uID0gbnVsbDtcblx0fVxuXG5cdC8vIGBmaXJzdGAgYW5kIGBjaGlsZGAgYXJlIG51bGxlZCBvdXQgaW4gZGVzdHJveV9lZmZlY3RfY2hpbGRyZW5cblx0Ly8gd2UgZG9uJ3QgbnVsbCBvdXQgYHBhcmVudGAgc28gdGhhdCBlcnJvciBwcm9wYWdhdGlvbiBjYW4gd29yayBjb3JyZWN0bHlcblx0ZWZmZWN0Lm5leHQgPVxuXHRcdGVmZmVjdC5wcmV2ID1cblx0XHRlZmZlY3QudGVhcmRvd24gPVxuXHRcdGVmZmVjdC5jdHggPVxuXHRcdGVmZmVjdC5kZXBzID1cblx0XHRlZmZlY3QuZm4gPVxuXHRcdGVmZmVjdC5ub2Rlc19zdGFydCA9XG5cdFx0ZWZmZWN0Lm5vZGVzX2VuZCA9XG5cdFx0XHRudWxsO1xufVxuXG4vKipcbiAqIERldGFjaCBhbiBlZmZlY3QgZnJvbSB0aGUgZWZmZWN0IHRyZWUsIGZyZWVpbmcgdXAgbWVtb3J5IGFuZFxuICogcmVkdWNpbmcgdGhlIGFtb3VudCBvZiB3b3JrIHRoYXQgaGFwcGVucyBvbiBzdWJzZXF1ZW50IHRyYXZlcnNhbHNcbiAqIEBwYXJhbSB7RWZmZWN0fSBlZmZlY3RcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHVubGlua19lZmZlY3QoZWZmZWN0KSB7XG5cdHZhciBwYXJlbnQgPSBlZmZlY3QucGFyZW50O1xuXHR2YXIgcHJldiA9IGVmZmVjdC5wcmV2O1xuXHR2YXIgbmV4dCA9IGVmZmVjdC5uZXh0O1xuXG5cdGlmIChwcmV2ICE9PSBudWxsKSBwcmV2Lm5leHQgPSBuZXh0O1xuXHRpZiAobmV4dCAhPT0gbnVsbCkgbmV4dC5wcmV2ID0gcHJldjtcblxuXHRpZiAocGFyZW50ICE9PSBudWxsKSB7XG5cdFx0aWYgKHBhcmVudC5maXJzdCA9PT0gZWZmZWN0KSBwYXJlbnQuZmlyc3QgPSBuZXh0O1xuXHRcdGlmIChwYXJlbnQubGFzdCA9PT0gZWZmZWN0KSBwYXJlbnQubGFzdCA9IHByZXY7XG5cdH1cbn1cblxuLyoqXG4gKiBXaGVuIGEgYmxvY2sgZWZmZWN0IGlzIHJlbW92ZWQsIHdlIGRvbid0IGltbWVkaWF0ZWx5IGRlc3Ryb3kgaXQgb3IgeWFuayBpdFxuICogb3V0IG9mIHRoZSBET00sIGJlY2F1c2UgaXQgbWlnaHQgaGF2ZSB0cmFuc2l0aW9ucy4gSW5zdGVhZCwgd2UgJ3BhdXNlJyBpdC5cbiAqIEl0IHN0YXlzIGFyb3VuZCAoaW4gbWVtb3J5LCBhbmQgaW4gdGhlIERPTSkgdW50aWwgb3V0cm8gdHJhbnNpdGlvbnMgaGF2ZVxuICogY29tcGxldGVkLCBhbmQgaWYgdGhlIHN0YXRlIGNoYW5nZSBpcyByZXZlcnNlZCB0aGVuIHdlIF9yZXN1bWVfIGl0LlxuICogQSBwYXVzZWQgZWZmZWN0IGRvZXMgbm90IHVwZGF0ZSwgYW5kIHRoZSBET00gc3VidHJlZSBiZWNvbWVzIGluZXJ0LlxuICogQHBhcmFtIHtFZmZlY3R9IGVmZmVjdFxuICogQHBhcmFtIHsoKSA9PiB2b2lkfSBbY2FsbGJhY2tdXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXVzZV9lZmZlY3QoZWZmZWN0LCBjYWxsYmFjaykge1xuXHQvKiogQHR5cGUge1RyYW5zaXRpb25NYW5hZ2VyW119ICovXG5cdHZhciB0cmFuc2l0aW9ucyA9IFtdO1xuXG5cdHBhdXNlX2NoaWxkcmVuKGVmZmVjdCwgdHJhbnNpdGlvbnMsIHRydWUpO1xuXG5cdHJ1bl9vdXRfdHJhbnNpdGlvbnModHJhbnNpdGlvbnMsICgpID0+IHtcblx0XHRkZXN0cm95X2VmZmVjdChlZmZlY3QpO1xuXHRcdGlmIChjYWxsYmFjaykgY2FsbGJhY2soKTtcblx0fSk7XG59XG5cbi8qKlxuICogQHBhcmFtIHtUcmFuc2l0aW9uTWFuYWdlcltdfSB0cmFuc2l0aW9uc1xuICogQHBhcmFtIHsoKSA9PiB2b2lkfSBmblxuICovXG5leHBvcnQgZnVuY3Rpb24gcnVuX291dF90cmFuc2l0aW9ucyh0cmFuc2l0aW9ucywgZm4pIHtcblx0dmFyIHJlbWFpbmluZyA9IHRyYW5zaXRpb25zLmxlbmd0aDtcblx0aWYgKHJlbWFpbmluZyA+IDApIHtcblx0XHR2YXIgY2hlY2sgPSAoKSA9PiAtLXJlbWFpbmluZyB8fCBmbigpO1xuXHRcdGZvciAodmFyIHRyYW5zaXRpb24gb2YgdHJhbnNpdGlvbnMpIHtcblx0XHRcdHRyYW5zaXRpb24ub3V0KGNoZWNrKTtcblx0XHR9XG5cdH0gZWxzZSB7XG5cdFx0Zm4oKTtcblx0fVxufVxuXG4vKipcbiAqIEBwYXJhbSB7RWZmZWN0fSBlZmZlY3RcbiAqIEBwYXJhbSB7VHJhbnNpdGlvbk1hbmFnZXJbXX0gdHJhbnNpdGlvbnNcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gbG9jYWxcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBhdXNlX2NoaWxkcmVuKGVmZmVjdCwgdHJhbnNpdGlvbnMsIGxvY2FsKSB7XG5cdGlmICgoZWZmZWN0LmYgJiBJTkVSVCkgIT09IDApIHJldHVybjtcblx0ZWZmZWN0LmYgXj0gSU5FUlQ7XG5cblx0aWYgKGVmZmVjdC50cmFuc2l0aW9ucyAhPT0gbnVsbCkge1xuXHRcdGZvciAoY29uc3QgdHJhbnNpdGlvbiBvZiBlZmZlY3QudHJhbnNpdGlvbnMpIHtcblx0XHRcdGlmICh0cmFuc2l0aW9uLmlzX2dsb2JhbCB8fCBsb2NhbCkge1xuXHRcdFx0XHR0cmFuc2l0aW9ucy5wdXNoKHRyYW5zaXRpb24pO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdHZhciBjaGlsZCA9IGVmZmVjdC5maXJzdDtcblxuXHR3aGlsZSAoY2hpbGQgIT09IG51bGwpIHtcblx0XHR2YXIgc2libGluZyA9IGNoaWxkLm5leHQ7XG5cdFx0dmFyIHRyYW5zcGFyZW50ID0gKGNoaWxkLmYgJiBFRkZFQ1RfVFJBTlNQQVJFTlQpICE9PSAwIHx8IChjaGlsZC5mICYgQlJBTkNIX0VGRkVDVCkgIT09IDA7XG5cdFx0Ly8gVE9ETyB3ZSBkb24ndCBuZWVkIHRvIGNhbGwgcGF1c2VfY2hpbGRyZW4gcmVjdXJzaXZlbHkgd2l0aCBhIGxpbmtlZCBsaXN0IGluIHBsYWNlXG5cdFx0Ly8gaXQncyBzbGlnaHRseSBtb3JlIGludm9sdmVkIHRob3VnaCBhcyB3ZSBoYXZlIHRvIGFjY291bnQgZm9yIGB0cmFuc3BhcmVudGAgY2hhbmdpbmdcblx0XHQvLyB0aHJvdWdoIHRoZSB0cmVlLlxuXHRcdHBhdXNlX2NoaWxkcmVuKGNoaWxkLCB0cmFuc2l0aW9ucywgdHJhbnNwYXJlbnQgPyBsb2NhbCA6IGZhbHNlKTtcblx0XHRjaGlsZCA9IHNpYmxpbmc7XG5cdH1cbn1cblxuLyoqXG4gKiBUaGUgb3Bwb3NpdGUgb2YgYHBhdXNlX2VmZmVjdGAuIFdlIGNhbGwgdGhpcyBpZiAoZm9yIGV4YW1wbGUpXG4gKiBgeGAgYmVjb21lcyBmYWxzeSB0aGVuIHRydXRoeTogYHsjaWYgeH0uLi57L2lmfWBcbiAqIEBwYXJhbSB7RWZmZWN0fSBlZmZlY3RcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlc3VtZV9lZmZlY3QoZWZmZWN0KSB7XG5cdHJlc3VtZV9jaGlsZHJlbihlZmZlY3QsIHRydWUpO1xufVxuXG4vKipcbiAqIEBwYXJhbSB7RWZmZWN0fSBlZmZlY3RcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gbG9jYWxcbiAqL1xuZnVuY3Rpb24gcmVzdW1lX2NoaWxkcmVuKGVmZmVjdCwgbG9jYWwpIHtcblx0aWYgKChlZmZlY3QuZiAmIElORVJUKSA9PT0gMCkgcmV0dXJuO1xuXG5cdC8vIElmIGEgZGVwZW5kZW5jeSBvZiB0aGlzIGVmZmVjdCBjaGFuZ2VkIHdoaWxlIGl0IHdhcyBwYXVzZWQsXG5cdC8vIGFwcGx5IHRoZSBjaGFuZ2Ugbm93XG5cdGlmIChjaGVja19kaXJ0aW5lc3MoZWZmZWN0KSkge1xuXHRcdHVwZGF0ZV9lZmZlY3QoZWZmZWN0KTtcblx0fVxuXG5cdC8vIEVuc3VyZSB3ZSB0b2dnbGUgdGhlIGZsYWcgYWZ0ZXIgcG9zc2libHkgdXBkYXRpbmcgdGhlIGVmZmVjdCBzbyB0aGF0XG5cdC8vIGVhY2ggYmxvY2sgbG9naWMgY2FuIGNvcnJlY3RseSBvcGVyYXRlIG9uIGluZXJ0IGl0ZW1zXG5cdGVmZmVjdC5mIF49IElORVJUO1xuXG5cdHZhciBjaGlsZCA9IGVmZmVjdC5maXJzdDtcblxuXHR3aGlsZSAoY2hpbGQgIT09IG51bGwpIHtcblx0XHR2YXIgc2libGluZyA9IGNoaWxkLm5leHQ7XG5cdFx0dmFyIHRyYW5zcGFyZW50ID0gKGNoaWxkLmYgJiBFRkZFQ1RfVFJBTlNQQVJFTlQpICE9PSAwIHx8IChjaGlsZC5mICYgQlJBTkNIX0VGRkVDVCkgIT09IDA7XG5cdFx0Ly8gVE9ETyB3ZSBkb24ndCBuZWVkIHRvIGNhbGwgcmVzdW1lX2NoaWxkcmVuIHJlY3Vyc2l2ZWx5IHdpdGggYSBsaW5rZWQgbGlzdCBpbiBwbGFjZVxuXHRcdC8vIGl0J3Mgc2xpZ2h0bHkgbW9yZSBpbnZvbHZlZCB0aG91Z2ggYXMgd2UgaGF2ZSB0byBhY2NvdW50IGZvciBgdHJhbnNwYXJlbnRgIGNoYW5naW5nXG5cdFx0Ly8gdGhyb3VnaCB0aGUgdHJlZS5cblx0XHRyZXN1bWVfY2hpbGRyZW4oY2hpbGQsIHRyYW5zcGFyZW50ID8gbG9jYWwgOiBmYWxzZSk7XG5cdFx0Y2hpbGQgPSBzaWJsaW5nO1xuXHR9XG5cblx0aWYgKGVmZmVjdC50cmFuc2l0aW9ucyAhPT0gbnVsbCkge1xuXHRcdGZvciAoY29uc3QgdHJhbnNpdGlvbiBvZiBlZmZlY3QudHJhbnNpdGlvbnMpIHtcblx0XHRcdGlmICh0cmFuc2l0aW9uLmlzX2dsb2JhbCB8fCBsb2NhbCkge1xuXHRcdFx0XHR0cmFuc2l0aW9uLmluKCk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG59XG4iLCIvKiogQGltcG9ydCB7IENvbXBvbmVudENvbnRleHQsIERlcml2ZWQsIEVmZmVjdCwgUmVhY3Rpb24sIFNpZ25hbCwgU291cmNlLCBWYWx1ZSB9IGZyb20gJyNjbGllbnQnICovXG5pbXBvcnQgeyBERVYgfSBmcm9tICdlc20tZW52JztcbmltcG9ydCB7IGRlZmluZV9wcm9wZXJ0eSwgZ2V0X2Rlc2NyaXB0b3JzLCBnZXRfcHJvdG90eXBlX29mIH0gZnJvbSAnLi4vc2hhcmVkL3V0aWxzLmpzJztcbmltcG9ydCB7XG5cdGRlc3Ryb3lfYmxvY2tfZWZmZWN0X2NoaWxkcmVuLFxuXHRkZXN0cm95X2VmZmVjdF9jaGlsZHJlbixcblx0ZGVzdHJveV9lZmZlY3RfZGVyaXZlZHMsXG5cdGVmZmVjdCxcblx0ZXhlY3V0ZV9lZmZlY3RfdGVhcmRvd24sXG5cdHVubGlua19lZmZlY3Rcbn0gZnJvbSAnLi9yZWFjdGl2aXR5L2VmZmVjdHMuanMnO1xuaW1wb3J0IHtcblx0RUZGRUNULFxuXHRSRU5ERVJfRUZGRUNULFxuXHRESVJUWSxcblx0TUFZQkVfRElSVFksXG5cdENMRUFOLFxuXHRERVJJVkVELFxuXHRVTk9XTkVELFxuXHRERVNUUk9ZRUQsXG5cdElORVJULFxuXHRCUkFOQ0hfRUZGRUNULFxuXHRTVEFURV9TWU1CT0wsXG5cdEJMT0NLX0VGRkVDVCxcblx0Uk9PVF9FRkZFQ1QsXG5cdExFR0FDWV9ERVJJVkVEX1BST1AsXG5cdERJU0NPTk5FQ1RFRCxcblx0Qk9VTkRBUllfRUZGRUNUXG59IGZyb20gJy4vY29uc3RhbnRzLmpzJztcbmltcG9ydCB7IGZsdXNoX3Rhc2tzIH0gZnJvbSAnLi9kb20vdGFzay5qcyc7XG5pbXBvcnQgeyBhZGRfb3duZXIgfSBmcm9tICcuL2Rldi9vd25lcnNoaXAuanMnO1xuaW1wb3J0IHsgaW50ZXJuYWxfc2V0LCBzZXQsIHNvdXJjZSB9IGZyb20gJy4vcmVhY3Rpdml0eS9zb3VyY2VzLmpzJztcbmltcG9ydCB7IGRlc3Ryb3lfZGVyaXZlZCwgZXhlY3V0ZV9kZXJpdmVkLCB1cGRhdGVfZGVyaXZlZCB9IGZyb20gJy4vcmVhY3Rpdml0eS9kZXJpdmVkcy5qcyc7XG5pbXBvcnQgKiBhcyBlIGZyb20gJy4vZXJyb3JzLmpzJztcbmltcG9ydCB7IGxpZmVjeWNsZV9vdXRzaWRlX2NvbXBvbmVudCB9IGZyb20gJy4uL3NoYXJlZC9lcnJvcnMuanMnO1xuaW1wb3J0IHsgRklMRU5BTUUgfSBmcm9tICcuLi8uLi9jb25zdGFudHMuanMnO1xuaW1wb3J0IHsgbGVnYWN5X21vZGVfZmxhZywgdHJhY2luZ19tb2RlX2ZsYWcgfSBmcm9tICcuLi9mbGFncy9pbmRleC5qcyc7XG5pbXBvcnQgeyB0cmFjaW5nX2V4cHJlc3Npb25zLCBnZXRfc3RhY2sgfSBmcm9tICcuL2Rldi90cmFjaW5nLmpzJztcblxuY29uc3QgRkxVU0hfTUlDUk9UQVNLID0gMDtcbmNvbnN0IEZMVVNIX1NZTkMgPSAxO1xuLy8gVXNlZCBmb3IgREVWIHRpbWUgZXJyb3IgaGFuZGxpbmdcbi8qKiBAcGFyYW0ge1dlYWtTZXQ8RXJyb3I+fSB2YWx1ZSAqL1xuY29uc3QgaGFuZGxlZF9lcnJvcnMgPSBuZXcgV2Vha1NldCgpO1xuZXhwb3J0IGxldCBpc190aHJvd2luZ19lcnJvciA9IGZhbHNlO1xuXG4vLyBVc2VkIGZvciBjb250cm9sbGluZyB0aGUgZmx1c2ggb2YgZWZmZWN0cy5cbmxldCBzY2hlZHVsZXJfbW9kZSA9IEZMVVNIX01JQ1JPVEFTSztcbi8vIFVzZWQgZm9yIGhhbmRsaW5nIHNjaGVkdWxpbmdcbmxldCBpc19taWNyb190YXNrX3F1ZXVlZCA9IGZhbHNlO1xuXG4vKiogQHR5cGUge0VmZmVjdCB8IG51bGx9ICovXG5sZXQgbGFzdF9zY2hlZHVsZWRfZWZmZWN0ID0gbnVsbDtcblxuZXhwb3J0IGxldCBpc19mbHVzaGluZ19lZmZlY3QgPSBmYWxzZTtcbmV4cG9ydCBsZXQgaXNfZGVzdHJveWluZ19lZmZlY3QgPSBmYWxzZTtcblxuLyoqIEBwYXJhbSB7Ym9vbGVhbn0gdmFsdWUgKi9cbmV4cG9ydCBmdW5jdGlvbiBzZXRfaXNfZmx1c2hpbmdfZWZmZWN0KHZhbHVlKSB7XG5cdGlzX2ZsdXNoaW5nX2VmZmVjdCA9IHZhbHVlO1xufVxuXG4vKiogQHBhcmFtIHtib29sZWFufSB2YWx1ZSAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNldF9pc19kZXN0cm95aW5nX2VmZmVjdCh2YWx1ZSkge1xuXHRpc19kZXN0cm95aW5nX2VmZmVjdCA9IHZhbHVlO1xufVxuXG4vLyBIYW5kbGUgZWZmZWN0IHF1ZXVlc1xuXG4vKiogQHR5cGUge0VmZmVjdFtdfSAqL1xubGV0IHF1ZXVlZF9yb290X2VmZmVjdHMgPSBbXTtcblxubGV0IGZsdXNoX2NvdW50ID0gMDtcbi8qKiBAdHlwZSB7RWZmZWN0W119IFN0YWNrIG9mIGVmZmVjdHMsIGRldiBvbmx5ICovXG5sZXQgZGV2X2VmZmVjdF9zdGFjayA9IFtdO1xuLy8gSGFuZGxlIHNpZ25hbCByZWFjdGl2aXR5IHRyZWUgZGVwZW5kZW5jaWVzIGFuZCByZWFjdGlvbnNcblxuLyoqIEB0eXBlIHtudWxsIHwgUmVhY3Rpb259ICovXG5leHBvcnQgbGV0IGFjdGl2ZV9yZWFjdGlvbiA9IG51bGw7XG5cbi8qKiBAcGFyYW0ge251bGwgfCBSZWFjdGlvbn0gcmVhY3Rpb24gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZXRfYWN0aXZlX3JlYWN0aW9uKHJlYWN0aW9uKSB7XG5cdGFjdGl2ZV9yZWFjdGlvbiA9IHJlYWN0aW9uO1xufVxuXG4vKiogQHR5cGUge251bGwgfCBFZmZlY3R9ICovXG5leHBvcnQgbGV0IGFjdGl2ZV9lZmZlY3QgPSBudWxsO1xuXG4vKiogQHBhcmFtIHtudWxsIHwgRWZmZWN0fSBlZmZlY3QgKi9cbmV4cG9ydCBmdW5jdGlvbiBzZXRfYWN0aXZlX2VmZmVjdChlZmZlY3QpIHtcblx0YWN0aXZlX2VmZmVjdCA9IGVmZmVjdDtcbn1cblxuLyoqXG4gKiBXaGVuIHNvdXJjZXMgYXJlIGNyZWF0ZWQgd2l0aGluIGEgZGVyaXZlZCwgd2UgcmVjb3JkIHRoZW0gc28gdGhhdCB3ZSBjYW4gc2FmZWx5IGFsbG93XG4gKiBsb2NhbCBtdXRhdGlvbnMgdG8gdGhlc2Ugc291cmNlcyB3aXRob3V0IHRoZSBzaWRlLWVmZmVjdCBlcnJvciBiZWluZyBpbnZva2VkIHVubmVjZXNzYXJpbHkuXG4gKiBAdHlwZSB7bnVsbCB8IFNvdXJjZVtdfVxuICovXG5leHBvcnQgbGV0IGRlcml2ZWRfc291cmNlcyA9IG51bGw7XG5cbi8qKlxuICogQHBhcmFtIHtTb3VyY2VbXSB8IG51bGx9IHNvdXJjZXNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNldF9kZXJpdmVkX3NvdXJjZXMoc291cmNlcykge1xuXHRkZXJpdmVkX3NvdXJjZXMgPSBzb3VyY2VzO1xufVxuXG4vKipcbiAqIFRoZSBkZXBlbmRlbmNpZXMgb2YgdGhlIHJlYWN0aW9uIHRoYXQgaXMgY3VycmVudGx5IGJlaW5nIGV4ZWN1dGVkLiBJbiBtYW55IGNhc2VzLFxuICogdGhlIGRlcGVuZGVuY2llcyBhcmUgdW5jaGFuZ2VkIGJldHdlZW4gcnVucywgYW5kIHNvIHRoaXMgd2lsbCBiZSBgbnVsbGAgdW5sZXNzXG4gKiBhbmQgdW50aWwgYSBuZXcgZGVwZW5kZW5jeSBpcyBhY2Nlc3NlZCDigJQgd2UgdHJhY2sgdGhpcyB2aWEgYHNraXBwZWRfZGVwc2BcbiAqIEB0eXBlIHtudWxsIHwgVmFsdWVbXX1cbiAqL1xuZXhwb3J0IGxldCBuZXdfZGVwcyA9IG51bGw7XG5cbmxldCBza2lwcGVkX2RlcHMgPSAwO1xuXG4vKipcbiAqIFRyYWNrcyB3cml0ZXMgdGhhdCB0aGUgZWZmZWN0IGl0J3MgZXhlY3V0ZWQgaW4gZG9lc24ndCBsaXN0ZW4gdG8geWV0LFxuICogc28gdGhhdCB0aGUgZGVwZW5kZW5jeSBjYW4gYmUgYWRkZWQgdG8gdGhlIGVmZmVjdCBsYXRlciBvbiBpZiBpdCB0aGVuIHJlYWRzIGl0XG4gKiBAdHlwZSB7bnVsbCB8IFNvdXJjZVtdfVxuICovXG5leHBvcnQgbGV0IHVudHJhY2tlZF93cml0ZXMgPSBudWxsO1xuXG4vKiogQHBhcmFtIHtudWxsIHwgU291cmNlW119IHZhbHVlICovXG5leHBvcnQgZnVuY3Rpb24gc2V0X3VudHJhY2tlZF93cml0ZXModmFsdWUpIHtcblx0dW50cmFja2VkX3dyaXRlcyA9IHZhbHVlO1xufVxuXG4vKiogQHR5cGUge251bWJlcn0gVXNlZCBieSBzb3VyY2VzIGFuZCBkZXJpdmVkcyBmb3IgaGFuZGxpbmcgdXBkYXRlcyB0byB1bm93bmVkIGRlcml2ZWRzIGl0IHN0YXJ0cyBmcm9tIDEgdG8gZGlmZmVyZW50aWF0ZSBiZXR3ZWVuIGEgY3JlYXRlZCBlZmZlY3QgYW5kIGEgcnVuIG9uZSBmb3IgdHJhY2luZyAqL1xubGV0IGN1cnJlbnRfdmVyc2lvbiA9IDE7XG5cbi8vIElmIHdlIGFyZSB3b3JraW5nIHdpdGggYSBnZXQoKSBjaGFpbiB0aGF0IGhhcyBubyBhY3RpdmUgY29udGFpbmVyLFxuLy8gdG8gcHJldmVudCBtZW1vcnkgbGVha3MsIHdlIHNraXAgYWRkaW5nIHRoZSByZWFjdGlvbi5cbmV4cG9ydCBsZXQgc2tpcF9yZWFjdGlvbiA9IGZhbHNlO1xuLy8gSGFuZGxlIGNvbGxlY3RpbmcgYWxsIHNpZ25hbHMgd2hpY2ggYXJlIHJlYWQgZHVyaW5nIGEgc3BlY2lmaWMgdGltZSBmcmFtZVxuLyoqIEB0eXBlIHtTZXQ8VmFsdWU+IHwgbnVsbH0gKi9cbmV4cG9ydCBsZXQgY2FwdHVyZWRfc2lnbmFscyA9IG51bGw7XG5cbi8qKiBAcGFyYW0ge1NldDxWYWx1ZT4gfCBudWxsfSB2YWx1ZSAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNldF9jYXB0dXJlZF9zaWduYWxzKHZhbHVlKSB7XG5cdGNhcHR1cmVkX3NpZ25hbHMgPSB2YWx1ZTtcbn1cblxuLy8gSGFuZGxpbmcgcnVudGltZSBjb21wb25lbnQgY29udGV4dFxuLyoqIEB0eXBlIHtDb21wb25lbnRDb250ZXh0IHwgbnVsbH0gKi9cbmV4cG9ydCBsZXQgY29tcG9uZW50X2NvbnRleHQgPSBudWxsO1xuXG4vKiogQHBhcmFtIHtDb21wb25lbnRDb250ZXh0IHwgbnVsbH0gY29udGV4dCAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNldF9jb21wb25lbnRfY29udGV4dChjb250ZXh0KSB7XG5cdGNvbXBvbmVudF9jb250ZXh0ID0gY29udGV4dDtcbn1cblxuLyoqXG4gKiBUaGUgY3VycmVudCBjb21wb25lbnQgZnVuY3Rpb24uIERpZmZlcmVudCBmcm9tIGN1cnJlbnQgY29tcG9uZW50IGNvbnRleHQ6XG4gKiBgYGBodG1sXG4gKiA8IS0tIEFwcC5zdmVsdGUgLS0+XG4gKiA8Rm9vPlxuICogICA8QmFyIC8+IDwhLS0gY29udGV4dCA9PSBGb28uc3ZlbHRlLCBmdW5jdGlvbiA9PSBBcHAuc3ZlbHRlIC0tPlxuICogPC9Gb28+XG4gKiBgYGBcbiAqIEB0eXBlIHtDb21wb25lbnRDb250ZXh0WydmdW5jdGlvbiddfVxuICovXG5leHBvcnQgbGV0IGRldl9jdXJyZW50X2NvbXBvbmVudF9mdW5jdGlvbiA9IG51bGw7XG5cbi8qKiBAcGFyYW0ge0NvbXBvbmVudENvbnRleHRbJ2Z1bmN0aW9uJ119IGZuICovXG5leHBvcnQgZnVuY3Rpb24gc2V0X2Rldl9jdXJyZW50X2NvbXBvbmVudF9mdW5jdGlvbihmbikge1xuXHRkZXZfY3VycmVudF9jb21wb25lbnRfZnVuY3Rpb24gPSBmbjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGluY3JlbWVudF92ZXJzaW9uKCkge1xuXHRyZXR1cm4gKytjdXJyZW50X3ZlcnNpb247XG59XG5cbi8qKiBAcmV0dXJucyB7Ym9vbGVhbn0gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc19ydW5lcygpIHtcblx0cmV0dXJuICFsZWdhY3lfbW9kZV9mbGFnIHx8IChjb21wb25lbnRfY29udGV4dCAhPT0gbnVsbCAmJiBjb21wb25lbnRfY29udGV4dC5sID09PSBudWxsKTtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmVzIHdoZXRoZXIgYSBkZXJpdmVkIG9yIGVmZmVjdCBpcyBkaXJ0eS5cbiAqIElmIGl0IGlzIE1BWUJFX0RJUlRZLCB3aWxsIHNldCB0aGUgc3RhdHVzIHRvIENMRUFOXG4gKiBAcGFyYW0ge1JlYWN0aW9ufSByZWFjdGlvblxuICogQHJldHVybnMge2Jvb2xlYW59XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjaGVja19kaXJ0aW5lc3MocmVhY3Rpb24pIHtcblx0dmFyIGZsYWdzID0gcmVhY3Rpb24uZjtcblxuXHRpZiAoKGZsYWdzICYgRElSVFkpICE9PSAwKSB7XG5cdFx0cmV0dXJuIHRydWU7XG5cdH1cblxuXHRpZiAoKGZsYWdzICYgTUFZQkVfRElSVFkpICE9PSAwKSB7XG5cdFx0dmFyIGRlcGVuZGVuY2llcyA9IHJlYWN0aW9uLmRlcHM7XG5cdFx0dmFyIGlzX3Vub3duZWQgPSAoZmxhZ3MgJiBVTk9XTkVEKSAhPT0gMDtcblxuXHRcdGlmIChkZXBlbmRlbmNpZXMgIT09IG51bGwpIHtcblx0XHRcdHZhciBpO1xuXG5cdFx0XHRpZiAoKGZsYWdzICYgRElTQ09OTkVDVEVEKSAhPT0gMCkge1xuXHRcdFx0XHRmb3IgKGkgPSAwOyBpIDwgZGVwZW5kZW5jaWVzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdFx0KGRlcGVuZGVuY2llc1tpXS5yZWFjdGlvbnMgPz89IFtdKS5wdXNoKHJlYWN0aW9uKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHJlYWN0aW9uLmYgXj0gRElTQ09OTkVDVEVEO1xuXHRcdFx0fVxuXG5cdFx0XHRmb3IgKGkgPSAwOyBpIDwgZGVwZW5kZW5jaWVzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdHZhciBkZXBlbmRlbmN5ID0gZGVwZW5kZW5jaWVzW2ldO1xuXG5cdFx0XHRcdGlmIChjaGVja19kaXJ0aW5lc3MoLyoqIEB0eXBlIHtEZXJpdmVkfSAqLyAoZGVwZW5kZW5jeSkpKSB7XG5cdFx0XHRcdFx0dXBkYXRlX2Rlcml2ZWQoLyoqIEB0eXBlIHtEZXJpdmVkfSAqLyAoZGVwZW5kZW5jeSkpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly8gSWYgd2UgYXJlIHdvcmtpbmcgd2l0aCBhbiB1bm93bmVkIHNpZ25hbCBhcyBwYXJ0IG9mIGFuIGVmZmVjdCAoZHVlIHRvICFza2lwX3JlYWN0aW9uKVxuXHRcdFx0XHQvLyBhbmQgdGhlIHZlcnNpb24gaGFzbid0IGNoYW5nZWQsIHdlIHN0aWxsIG5lZWQgdG8gY2hlY2sgdGhhdCB0aGlzIHJlYWN0aW9uXG5cdFx0XHRcdC8vIGlzIGxpbmtlZCB0byB0aGUgZGVwZW5kZW5jeSBzb3VyY2Ug4oCTIG90aGVyd2lzZSBmdXR1cmUgdXBkYXRlcyB3aWxsIG5vdCBiZSBjYXVnaHQuXG5cdFx0XHRcdGlmIChcblx0XHRcdFx0XHRpc191bm93bmVkICYmXG5cdFx0XHRcdFx0YWN0aXZlX2VmZmVjdCAhPT0gbnVsbCAmJlxuXHRcdFx0XHRcdCFza2lwX3JlYWN0aW9uICYmXG5cdFx0XHRcdFx0IWRlcGVuZGVuY3k/LnJlYWN0aW9ucz8uaW5jbHVkZXMocmVhY3Rpb24pXG5cdFx0XHRcdCkge1xuXHRcdFx0XHRcdChkZXBlbmRlbmN5LnJlYWN0aW9ucyA/Pz0gW10pLnB1c2gocmVhY3Rpb24pO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKGRlcGVuZGVuY3kudmVyc2lvbiA+IHJlYWN0aW9uLnZlcnNpb24pIHtcblx0XHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8vIFVub3duZWQgc2lnbmFscyBzaG91bGQgbmV2ZXIgYmUgbWFya2VkIGFzIGNsZWFuIHVubGVzcyB0aGV5XG5cdFx0Ly8gYXJlIHVzZWQgd2l0aGluIGFuIGFjdGl2ZV9lZmZlY3Qgd2l0aG91dCBza2lwX3JlYWN0aW9uXG5cdFx0aWYgKCFpc191bm93bmVkIHx8IChhY3RpdmVfZWZmZWN0ICE9PSBudWxsICYmICFza2lwX3JlYWN0aW9uKSkge1xuXHRcdFx0c2V0X3NpZ25hbF9zdGF0dXMocmVhY3Rpb24sIENMRUFOKTtcblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gZmFsc2U7XG59XG5cbi8qKlxuICogQHBhcmFtIHt1bmtub3dufSBlcnJvclxuICogQHBhcmFtIHtFZmZlY3R9IGVmZmVjdFxuICovXG5mdW5jdGlvbiBwcm9wYWdhdGVfZXJyb3IoZXJyb3IsIGVmZmVjdCkge1xuXHQvKiogQHR5cGUge0VmZmVjdCB8IG51bGx9ICovXG5cdHZhciBjdXJyZW50ID0gZWZmZWN0O1xuXG5cdHdoaWxlIChjdXJyZW50ICE9PSBudWxsKSB7XG5cdFx0aWYgKChjdXJyZW50LmYgJiBCT1VOREFSWV9FRkZFQ1QpICE9PSAwKSB7XG5cdFx0XHR0cnkge1xuXHRcdFx0XHQvLyBAdHMtZXhwZWN0LWVycm9yXG5cdFx0XHRcdGN1cnJlbnQuZm4oZXJyb3IpO1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9IGNhdGNoIHtcblx0XHRcdFx0Ly8gUmVtb3ZlIGJvdW5kYXJ5IGZsYWcgZnJvbSBlZmZlY3Rcblx0XHRcdFx0Y3VycmVudC5mIF49IEJPVU5EQVJZX0VGRkVDVDtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRjdXJyZW50ID0gY3VycmVudC5wYXJlbnQ7XG5cdH1cblxuXHRpc190aHJvd2luZ19lcnJvciA9IGZhbHNlO1xuXHR0aHJvdyBlcnJvcjtcbn1cblxuLyoqXG4gKiBAcGFyYW0ge0VmZmVjdH0gZWZmZWN0XG4gKi9cbmZ1bmN0aW9uIHNob3VsZF9yZXRocm93X2Vycm9yKGVmZmVjdCkge1xuXHRyZXR1cm4gKFxuXHRcdChlZmZlY3QuZiAmIERFU1RST1lFRCkgPT09IDAgJiZcblx0XHQoZWZmZWN0LnBhcmVudCA9PT0gbnVsbCB8fCAoZWZmZWN0LnBhcmVudC5mICYgQk9VTkRBUllfRUZGRUNUKSA9PT0gMClcblx0KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlc2V0X2lzX3Rocm93aW5nX2Vycm9yKCkge1xuXHRpc190aHJvd2luZ19lcnJvciA9IGZhbHNlO1xufVxuXG4vKipcbiAqIEBwYXJhbSB7dW5rbm93bn0gZXJyb3JcbiAqIEBwYXJhbSB7RWZmZWN0fSBlZmZlY3RcbiAqIEBwYXJhbSB7RWZmZWN0IHwgbnVsbH0gcHJldmlvdXNfZWZmZWN0XG4gKiBAcGFyYW0ge0NvbXBvbmVudENvbnRleHQgfCBudWxsfSBjb21wb25lbnRfY29udGV4dFxuICovXG5leHBvcnQgZnVuY3Rpb24gaGFuZGxlX2Vycm9yKGVycm9yLCBlZmZlY3QsIHByZXZpb3VzX2VmZmVjdCwgY29tcG9uZW50X2NvbnRleHQpIHtcblx0aWYgKGlzX3Rocm93aW5nX2Vycm9yKSB7XG5cdFx0aWYgKHByZXZpb3VzX2VmZmVjdCA9PT0gbnVsbCkge1xuXHRcdFx0aXNfdGhyb3dpbmdfZXJyb3IgPSBmYWxzZTtcblx0XHR9XG5cblx0XHRpZiAoc2hvdWxkX3JldGhyb3dfZXJyb3IoZWZmZWN0KSkge1xuXHRcdFx0dGhyb3cgZXJyb3I7XG5cdFx0fVxuXG5cdFx0cmV0dXJuO1xuXHR9XG5cblx0aWYgKHByZXZpb3VzX2VmZmVjdCAhPT0gbnVsbCkge1xuXHRcdGlzX3Rocm93aW5nX2Vycm9yID0gdHJ1ZTtcblx0fVxuXG5cdGlmIChcblx0XHQhREVWIHx8XG5cdFx0Y29tcG9uZW50X2NvbnRleHQgPT09IG51bGwgfHxcblx0XHQhKGVycm9yIGluc3RhbmNlb2YgRXJyb3IpIHx8XG5cdFx0aGFuZGxlZF9lcnJvcnMuaGFzKGVycm9yKVxuXHQpIHtcblx0XHRwcm9wYWdhdGVfZXJyb3IoZXJyb3IsIGVmZmVjdCk7XG5cdFx0cmV0dXJuO1xuXHR9XG5cblx0aGFuZGxlZF9lcnJvcnMuYWRkKGVycm9yKTtcblxuXHRjb25zdCBjb21wb25lbnRfc3RhY2sgPSBbXTtcblxuXHRjb25zdCBlZmZlY3RfbmFtZSA9IGVmZmVjdC5mbj8ubmFtZTtcblxuXHRpZiAoZWZmZWN0X25hbWUpIHtcblx0XHRjb21wb25lbnRfc3RhY2sucHVzaChlZmZlY3RfbmFtZSk7XG5cdH1cblxuXHQvKiogQHR5cGUge0NvbXBvbmVudENvbnRleHQgfCBudWxsfSAqL1xuXHRsZXQgY3VycmVudF9jb250ZXh0ID0gY29tcG9uZW50X2NvbnRleHQ7XG5cblx0d2hpbGUgKGN1cnJlbnRfY29udGV4dCAhPT0gbnVsbCkge1xuXHRcdGlmIChERVYpIHtcblx0XHRcdC8qKiBAdHlwZSB7c3RyaW5nfSAqL1xuXHRcdFx0dmFyIGZpbGVuYW1lID0gY3VycmVudF9jb250ZXh0LmZ1bmN0aW9uPy5bRklMRU5BTUVdO1xuXG5cdFx0XHRpZiAoZmlsZW5hbWUpIHtcblx0XHRcdFx0Y29uc3QgZmlsZSA9IGZpbGVuYW1lLnNwbGl0KCcvJykucG9wKCk7XG5cdFx0XHRcdGNvbXBvbmVudF9zdGFjay5wdXNoKGZpbGUpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGN1cnJlbnRfY29udGV4dCA9IGN1cnJlbnRfY29udGV4dC5wO1xuXHR9XG5cblx0Y29uc3QgaW5kZW50ID0gL0ZpcmVmb3gvLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCkgPyAnICAnIDogJ1xcdCc7XG5cdGRlZmluZV9wcm9wZXJ0eShlcnJvciwgJ21lc3NhZ2UnLCB7XG5cdFx0dmFsdWU6IGVycm9yLm1lc3NhZ2UgKyBgXFxuJHtjb21wb25lbnRfc3RhY2subWFwKChuYW1lKSA9PiBgXFxuJHtpbmRlbnR9aW4gJHtuYW1lfWApLmpvaW4oJycpfVxcbmBcblx0fSk7XG5cdGRlZmluZV9wcm9wZXJ0eShlcnJvciwgJ2NvbXBvbmVudF9zdGFjaycsIHtcblx0XHR2YWx1ZTogY29tcG9uZW50X3N0YWNrXG5cdH0pO1xuXG5cdGNvbnN0IHN0YWNrID0gZXJyb3Iuc3RhY2s7XG5cblx0Ly8gRmlsdGVyIG91dCBpbnRlcm5hbCBmaWxlcyBmcm9tIGNhbGxzdGFja1xuXHRpZiAoc3RhY2spIHtcblx0XHRjb25zdCBsaW5lcyA9IHN0YWNrLnNwbGl0KCdcXG4nKTtcblx0XHRjb25zdCBuZXdfbGluZXMgPSBbXTtcblx0XHRmb3IgKGxldCBpID0gMDsgaSA8IGxpbmVzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRjb25zdCBsaW5lID0gbGluZXNbaV07XG5cdFx0XHRpZiAobGluZS5pbmNsdWRlcygnc3ZlbHRlL3NyYy9pbnRlcm5hbCcpKSB7XG5cdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0fVxuXHRcdFx0bmV3X2xpbmVzLnB1c2gobGluZSk7XG5cdFx0fVxuXHRcdGRlZmluZV9wcm9wZXJ0eShlcnJvciwgJ3N0YWNrJywge1xuXHRcdFx0dmFsdWU6IG5ld19saW5lcy5qb2luKCdcXG4nKVxuXHRcdH0pO1xuXHR9XG5cblx0cHJvcGFnYXRlX2Vycm9yKGVycm9yLCBlZmZlY3QpO1xuXG5cdGlmIChzaG91bGRfcmV0aHJvd19lcnJvcihlZmZlY3QpKSB7XG5cdFx0dGhyb3cgZXJyb3I7XG5cdH1cbn1cblxuLyoqXG4gKiBAdGVtcGxhdGUgVlxuICogQHBhcmFtIHtSZWFjdGlvbn0gcmVhY3Rpb25cbiAqIEByZXR1cm5zIHtWfVxuICovXG5leHBvcnQgZnVuY3Rpb24gdXBkYXRlX3JlYWN0aW9uKHJlYWN0aW9uKSB7XG5cdHZhciBwcmV2aW91c19kZXBzID0gbmV3X2RlcHM7XG5cdHZhciBwcmV2aW91c19za2lwcGVkX2RlcHMgPSBza2lwcGVkX2RlcHM7XG5cdHZhciBwcmV2aW91c191bnRyYWNrZWRfd3JpdGVzID0gdW50cmFja2VkX3dyaXRlcztcblx0dmFyIHByZXZpb3VzX3JlYWN0aW9uID0gYWN0aXZlX3JlYWN0aW9uO1xuXHR2YXIgcHJldmlvdXNfc2tpcF9yZWFjdGlvbiA9IHNraXBfcmVhY3Rpb247XG5cdHZhciBwcmV2X2Rlcml2ZWRfc291cmNlcyA9IGRlcml2ZWRfc291cmNlcztcblx0dmFyIHByZXZpb3VzX2NvbXBvbmVudF9jb250ZXh0ID0gY29tcG9uZW50X2NvbnRleHQ7XG5cdHZhciBmbGFncyA9IHJlYWN0aW9uLmY7XG5cblx0bmV3X2RlcHMgPSAvKiogQHR5cGUge251bGwgfCBWYWx1ZVtdfSAqLyAobnVsbCk7XG5cdHNraXBwZWRfZGVwcyA9IDA7XG5cdHVudHJhY2tlZF93cml0ZXMgPSBudWxsO1xuXHRhY3RpdmVfcmVhY3Rpb24gPSAoZmxhZ3MgJiAoQlJBTkNIX0VGRkVDVCB8IFJPT1RfRUZGRUNUKSkgPT09IDAgPyByZWFjdGlvbiA6IG51bGw7XG5cdHNraXBfcmVhY3Rpb24gPSAhaXNfZmx1c2hpbmdfZWZmZWN0ICYmIChmbGFncyAmIFVOT1dORUQpICE9PSAwO1xuXHRkZXJpdmVkX3NvdXJjZXMgPSBudWxsO1xuXHRjb21wb25lbnRfY29udGV4dCA9IHJlYWN0aW9uLmN0eDtcblxuXHR0cnkge1xuXHRcdHZhciByZXN1bHQgPSAvKiogQHR5cGUge0Z1bmN0aW9ufSAqLyAoMCwgcmVhY3Rpb24uZm4pKCk7XG5cdFx0dmFyIGRlcHMgPSByZWFjdGlvbi5kZXBzO1xuXG5cdFx0aWYgKG5ld19kZXBzICE9PSBudWxsKSB7XG5cdFx0XHR2YXIgaTtcblxuXHRcdFx0cmVtb3ZlX3JlYWN0aW9ucyhyZWFjdGlvbiwgc2tpcHBlZF9kZXBzKTtcblxuXHRcdFx0aWYgKGRlcHMgIT09IG51bGwgJiYgc2tpcHBlZF9kZXBzID4gMCkge1xuXHRcdFx0XHRkZXBzLmxlbmd0aCA9IHNraXBwZWRfZGVwcyArIG5ld19kZXBzLmxlbmd0aDtcblx0XHRcdFx0Zm9yIChpID0gMDsgaSA8IG5ld19kZXBzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdFx0ZGVwc1tza2lwcGVkX2RlcHMgKyBpXSA9IG5ld19kZXBzW2ldO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRyZWFjdGlvbi5kZXBzID0gZGVwcyA9IG5ld19kZXBzO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoIXNraXBfcmVhY3Rpb24pIHtcblx0XHRcdFx0Zm9yIChpID0gc2tpcHBlZF9kZXBzOyBpIDwgZGVwcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRcdChkZXBzW2ldLnJlYWN0aW9ucyA/Pz0gW10pLnB1c2gocmVhY3Rpb24pO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSBlbHNlIGlmIChkZXBzICE9PSBudWxsICYmIHNraXBwZWRfZGVwcyA8IGRlcHMubGVuZ3RoKSB7XG5cdFx0XHRyZW1vdmVfcmVhY3Rpb25zKHJlYWN0aW9uLCBza2lwcGVkX2RlcHMpO1xuXHRcdFx0ZGVwcy5sZW5ndGggPSBza2lwcGVkX2RlcHM7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHJlc3VsdDtcblx0fSBmaW5hbGx5IHtcblx0XHRuZXdfZGVwcyA9IHByZXZpb3VzX2RlcHM7XG5cdFx0c2tpcHBlZF9kZXBzID0gcHJldmlvdXNfc2tpcHBlZF9kZXBzO1xuXHRcdHVudHJhY2tlZF93cml0ZXMgPSBwcmV2aW91c191bnRyYWNrZWRfd3JpdGVzO1xuXHRcdGFjdGl2ZV9yZWFjdGlvbiA9IHByZXZpb3VzX3JlYWN0aW9uO1xuXHRcdHNraXBfcmVhY3Rpb24gPSBwcmV2aW91c19za2lwX3JlYWN0aW9uO1xuXHRcdGRlcml2ZWRfc291cmNlcyA9IHByZXZfZGVyaXZlZF9zb3VyY2VzO1xuXHRcdGNvbXBvbmVudF9jb250ZXh0ID0gcHJldmlvdXNfY29tcG9uZW50X2NvbnRleHQ7XG5cdH1cbn1cblxuLyoqXG4gKiBAdGVtcGxhdGUgVlxuICogQHBhcmFtIHtSZWFjdGlvbn0gc2lnbmFsXG4gKiBAcGFyYW0ge1ZhbHVlPFY+fSBkZXBlbmRlbmN5XG4gKiBAcmV0dXJucyB7dm9pZH1cbiAqL1xuZnVuY3Rpb24gcmVtb3ZlX3JlYWN0aW9uKHNpZ25hbCwgZGVwZW5kZW5jeSkge1xuXHRsZXQgcmVhY3Rpb25zID0gZGVwZW5kZW5jeS5yZWFjdGlvbnM7XG5cdGlmIChyZWFjdGlvbnMgIT09IG51bGwpIHtcblx0XHR2YXIgaW5kZXggPSByZWFjdGlvbnMuaW5kZXhPZihzaWduYWwpO1xuXHRcdGlmIChpbmRleCAhPT0gLTEpIHtcblx0XHRcdHZhciBuZXdfbGVuZ3RoID0gcmVhY3Rpb25zLmxlbmd0aCAtIDE7XG5cdFx0XHRpZiAobmV3X2xlbmd0aCA9PT0gMCkge1xuXHRcdFx0XHRyZWFjdGlvbnMgPSBkZXBlbmRlbmN5LnJlYWN0aW9ucyA9IG51bGw7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQvLyBTd2FwIHdpdGggbGFzdCBlbGVtZW50IGFuZCB0aGVuIHJlbW92ZS5cblx0XHRcdFx0cmVhY3Rpb25zW2luZGV4XSA9IHJlYWN0aW9uc1tuZXdfbGVuZ3RoXTtcblx0XHRcdFx0cmVhY3Rpb25zLnBvcCgpO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXHQvLyBJZiB0aGUgZGVyaXZlZCBoYXMgbm8gcmVhY3Rpb25zLCB0aGVuIHdlIGNhbiBkaXNjb25uZWN0IGl0IGZyb20gdGhlIGdyYXBoLFxuXHQvLyBhbGxvd2luZyBpdCB0byBlaXRoZXIgcmVjb25uZWN0IGluIHRoZSBmdXR1cmUsIG9yIGJlIEdDJ2QgYnkgdGhlIFZNLlxuXHRpZiAoXG5cdFx0cmVhY3Rpb25zID09PSBudWxsICYmXG5cdFx0KGRlcGVuZGVuY3kuZiAmIERFUklWRUQpICE9PSAwICYmXG5cdFx0Ly8gRGVzdHJveWluZyBhIGNoaWxkIGVmZmVjdCB3aGlsZSB1cGRhdGluZyBhIHBhcmVudCBlZmZlY3QgY2FuIGNhdXNlIGEgZGVwZW5kZW5jeSB0byBhcHBlYXJcblx0XHQvLyB0byBiZSB1bnVzZWQsIHdoZW4gaW4gZmFjdCBpdCBpcyB1c2VkIGJ5IHRoZSBjdXJyZW50bHktdXBkYXRpbmcgcGFyZW50LiBDaGVja2luZyBgbmV3X2RlcHNgXG5cdFx0Ly8gYWxsb3dzIHVzIHRvIHNraXAgdGhlIGV4cGVuc2l2ZSB3b3JrIG9mIGRpc2Nvbm5lY3RpbmcgYW5kIGltbWVkaWF0ZWx5IHJlY29ubmVjdGluZyBpdFxuXHRcdChuZXdfZGVwcyA9PT0gbnVsbCB8fCAhbmV3X2RlcHMuaW5jbHVkZXMoZGVwZW5kZW5jeSkpXG5cdCkge1xuXHRcdHNldF9zaWduYWxfc3RhdHVzKGRlcGVuZGVuY3ksIE1BWUJFX0RJUlRZKTtcblx0XHQvLyBJZiB3ZSBhcmUgd29ya2luZyB3aXRoIGEgZGVyaXZlZCB0aGF0IGlzIG93bmVkIGJ5IGFuIGVmZmVjdCwgdGhlbiBtYXJrIGl0IGFzIGJlaW5nXG5cdFx0Ly8gZGlzY29ubmVjdGVkLlxuXHRcdGlmICgoZGVwZW5kZW5jeS5mICYgKFVOT1dORUQgfCBESVNDT05ORUNURUQpKSA9PT0gMCkge1xuXHRcdFx0ZGVwZW5kZW5jeS5mIF49IERJU0NPTk5FQ1RFRDtcblx0XHR9XG5cdFx0cmVtb3ZlX3JlYWN0aW9ucygvKiogQHR5cGUge0Rlcml2ZWR9ICoqLyAoZGVwZW5kZW5jeSksIDApO1xuXHR9XG59XG5cbi8qKlxuICogQHBhcmFtIHtSZWFjdGlvbn0gc2lnbmFsXG4gKiBAcGFyYW0ge251bWJlcn0gc3RhcnRfaW5kZXhcbiAqIEByZXR1cm5zIHt2b2lkfVxuICovXG5leHBvcnQgZnVuY3Rpb24gcmVtb3ZlX3JlYWN0aW9ucyhzaWduYWwsIHN0YXJ0X2luZGV4KSB7XG5cdHZhciBkZXBlbmRlbmNpZXMgPSBzaWduYWwuZGVwcztcblx0aWYgKGRlcGVuZGVuY2llcyA9PT0gbnVsbCkgcmV0dXJuO1xuXG5cdGZvciAodmFyIGkgPSBzdGFydF9pbmRleDsgaSA8IGRlcGVuZGVuY2llcy5sZW5ndGg7IGkrKykge1xuXHRcdHJlbW92ZV9yZWFjdGlvbihzaWduYWwsIGRlcGVuZGVuY2llc1tpXSk7XG5cdH1cbn1cblxuLyoqXG4gKiBAcGFyYW0ge0VmZmVjdH0gZWZmZWN0XG4gKiBAcmV0dXJucyB7dm9pZH1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHVwZGF0ZV9lZmZlY3QoZWZmZWN0KSB7XG5cdHZhciBmbGFncyA9IGVmZmVjdC5mO1xuXG5cdGlmICgoZmxhZ3MgJiBERVNUUk9ZRUQpICE9PSAwKSB7XG5cdFx0cmV0dXJuO1xuXHR9XG5cblx0c2V0X3NpZ25hbF9zdGF0dXMoZWZmZWN0LCBDTEVBTik7XG5cblx0dmFyIHByZXZpb3VzX2VmZmVjdCA9IGFjdGl2ZV9lZmZlY3Q7XG5cdHZhciBwcmV2aW91c19jb21wb25lbnRfY29udGV4dCA9IGNvbXBvbmVudF9jb250ZXh0O1xuXG5cdGFjdGl2ZV9lZmZlY3QgPSBlZmZlY3Q7XG5cblx0aWYgKERFVikge1xuXHRcdHZhciBwcmV2aW91c19jb21wb25lbnRfZm4gPSBkZXZfY3VycmVudF9jb21wb25lbnRfZnVuY3Rpb247XG5cdFx0ZGV2X2N1cnJlbnRfY29tcG9uZW50X2Z1bmN0aW9uID0gZWZmZWN0LmNvbXBvbmVudF9mdW5jdGlvbjtcblx0fVxuXG5cdHRyeSB7XG5cdFx0aWYgKChmbGFncyAmIEJMT0NLX0VGRkVDVCkgIT09IDApIHtcblx0XHRcdGRlc3Ryb3lfYmxvY2tfZWZmZWN0X2NoaWxkcmVuKGVmZmVjdCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGRlc3Ryb3lfZWZmZWN0X2NoaWxkcmVuKGVmZmVjdCk7XG5cdFx0fVxuXHRcdGRlc3Ryb3lfZWZmZWN0X2Rlcml2ZWRzKGVmZmVjdCk7XG5cblx0XHRleGVjdXRlX2VmZmVjdF90ZWFyZG93bihlZmZlY3QpO1xuXHRcdHZhciB0ZWFyZG93biA9IHVwZGF0ZV9yZWFjdGlvbihlZmZlY3QpO1xuXHRcdGVmZmVjdC50ZWFyZG93biA9IHR5cGVvZiB0ZWFyZG93biA9PT0gJ2Z1bmN0aW9uJyA/IHRlYXJkb3duIDogbnVsbDtcblx0XHRlZmZlY3QudmVyc2lvbiA9IGN1cnJlbnRfdmVyc2lvbjtcblxuXHRcdGlmIChERVYpIHtcblx0XHRcdGRldl9lZmZlY3Rfc3RhY2sucHVzaChlZmZlY3QpO1xuXHRcdH1cblx0fSBjYXRjaCAoZXJyb3IpIHtcblx0XHRoYW5kbGVfZXJyb3IoZXJyb3IsIGVmZmVjdCwgcHJldmlvdXNfZWZmZWN0LCBwcmV2aW91c19jb21wb25lbnRfY29udGV4dCB8fCBlZmZlY3QuY3R4KTtcblx0fSBmaW5hbGx5IHtcblx0XHRhY3RpdmVfZWZmZWN0ID0gcHJldmlvdXNfZWZmZWN0O1xuXG5cdFx0aWYgKERFVikge1xuXHRcdFx0ZGV2X2N1cnJlbnRfY29tcG9uZW50X2Z1bmN0aW9uID0gcHJldmlvdXNfY29tcG9uZW50X2ZuO1xuXHRcdH1cblx0fVxufVxuXG5mdW5jdGlvbiBsb2dfZWZmZWN0X3N0YWNrKCkge1xuXHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc29sZVxuXHRjb25zb2xlLmVycm9yKFxuXHRcdCdMYXN0IHRlbiBlZmZlY3RzIHdlcmU6ICcsXG5cdFx0ZGV2X2VmZmVjdF9zdGFjay5zbGljZSgtMTApLm1hcCgoZCkgPT4gZC5mbilcblx0KTtcblx0ZGV2X2VmZmVjdF9zdGFjayA9IFtdO1xufVxuXG5mdW5jdGlvbiBpbmZpbml0ZV9sb29wX2d1YXJkKCkge1xuXHRpZiAoZmx1c2hfY291bnQgPiAxMDAwKSB7XG5cdFx0Zmx1c2hfY291bnQgPSAwO1xuXHRcdHRyeSB7XG5cdFx0XHRlLmVmZmVjdF91cGRhdGVfZGVwdGhfZXhjZWVkZWQoKTtcblx0XHR9IGNhdGNoIChlcnJvcikge1xuXHRcdFx0aWYgKERFVikge1xuXHRcdFx0XHQvLyBzdGFjayBpcyBnYXJiYWdlLCBpZ25vcmUuIEluc3RlYWQgYWRkIGEgY29uc29sZS5lcnJvciBtZXNzYWdlLlxuXHRcdFx0XHRkZWZpbmVfcHJvcGVydHkoZXJyb3IsICdzdGFjaycsIHtcblx0XHRcdFx0XHR2YWx1ZTogJydcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0XHQvLyBUcnkgYW5kIGhhbmRsZSB0aGUgZXJyb3Igc28gaXQgY2FuIGJlIGNhdWdodCBhdCBhIGJvdW5kYXJ5LCB0aGF0J3Ncblx0XHRcdC8vIGlmIHRoZXJlJ3MgYW4gZWZmZWN0IGF2YWlsYWJsZSBmcm9tIHdoZW4gaXQgd2FzIGxhc3Qgc2NoZWR1bGVkXG5cdFx0XHRpZiAobGFzdF9zY2hlZHVsZWRfZWZmZWN0ICE9PSBudWxsKSB7XG5cdFx0XHRcdGlmIChERVYpIHtcblx0XHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdFx0aGFuZGxlX2Vycm9yKGVycm9yLCBsYXN0X3NjaGVkdWxlZF9lZmZlY3QsIG51bGwsIG51bGwpO1xuXHRcdFx0XHRcdH0gY2F0Y2ggKGUpIHtcblx0XHRcdFx0XHRcdC8vIE9ubHkgbG9nIHRoZSBlZmZlY3Qgc3RhY2sgaWYgdGhlIGVycm9yIGlzIHJlLXRocm93blxuXHRcdFx0XHRcdFx0bG9nX2VmZmVjdF9zdGFjaygpO1xuXHRcdFx0XHRcdFx0dGhyb3cgZTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0aGFuZGxlX2Vycm9yKGVycm9yLCBsYXN0X3NjaGVkdWxlZF9lZmZlY3QsIG51bGwsIG51bGwpO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRpZiAoREVWKSB7XG5cdFx0XHRcdFx0bG9nX2VmZmVjdF9zdGFjaygpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHRocm93IGVycm9yO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXHRmbHVzaF9jb3VudCsrO1xufVxuXG4vKipcbiAqIEBwYXJhbSB7QXJyYXk8RWZmZWN0Pn0gcm9vdF9lZmZlY3RzXG4gKiBAcmV0dXJucyB7dm9pZH1cbiAqL1xuZnVuY3Rpb24gZmx1c2hfcXVldWVkX3Jvb3RfZWZmZWN0cyhyb290X2VmZmVjdHMpIHtcblx0dmFyIGxlbmd0aCA9IHJvb3RfZWZmZWN0cy5sZW5ndGg7XG5cdGlmIChsZW5ndGggPT09IDApIHtcblx0XHRyZXR1cm47XG5cdH1cblx0aW5maW5pdGVfbG9vcF9ndWFyZCgpO1xuXG5cdHZhciBwcmV2aW91c2x5X2ZsdXNoaW5nX2VmZmVjdCA9IGlzX2ZsdXNoaW5nX2VmZmVjdDtcblx0aXNfZmx1c2hpbmdfZWZmZWN0ID0gdHJ1ZTtcblxuXHR0cnkge1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcblx0XHRcdHZhciBlZmZlY3QgPSByb290X2VmZmVjdHNbaV07XG5cblx0XHRcdGlmICgoZWZmZWN0LmYgJiBDTEVBTikgPT09IDApIHtcblx0XHRcdFx0ZWZmZWN0LmYgXj0gQ0xFQU47XG5cdFx0XHR9XG5cblx0XHRcdC8qKiBAdHlwZSB7RWZmZWN0W119ICovXG5cdFx0XHR2YXIgY29sbGVjdGVkX2VmZmVjdHMgPSBbXTtcblxuXHRcdFx0cHJvY2Vzc19lZmZlY3RzKGVmZmVjdCwgY29sbGVjdGVkX2VmZmVjdHMpO1xuXHRcdFx0Zmx1c2hfcXVldWVkX2VmZmVjdHMoY29sbGVjdGVkX2VmZmVjdHMpO1xuXHRcdH1cblx0fSBmaW5hbGx5IHtcblx0XHRpc19mbHVzaGluZ19lZmZlY3QgPSBwcmV2aW91c2x5X2ZsdXNoaW5nX2VmZmVjdDtcblx0fVxufVxuXG4vKipcbiAqIEBwYXJhbSB7QXJyYXk8RWZmZWN0Pn0gZWZmZWN0c1xuICogQHJldHVybnMge3ZvaWR9XG4gKi9cbmZ1bmN0aW9uIGZsdXNoX3F1ZXVlZF9lZmZlY3RzKGVmZmVjdHMpIHtcblx0dmFyIGxlbmd0aCA9IGVmZmVjdHMubGVuZ3RoO1xuXHRpZiAobGVuZ3RoID09PSAwKSByZXR1cm47XG5cblx0Zm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuXHRcdHZhciBlZmZlY3QgPSBlZmZlY3RzW2ldO1xuXG5cdFx0aWYgKChlZmZlY3QuZiAmIChERVNUUk9ZRUQgfCBJTkVSVCkpID09PSAwKSB7XG5cdFx0XHR0cnkge1xuXHRcdFx0XHRpZiAoY2hlY2tfZGlydGluZXNzKGVmZmVjdCkpIHtcblx0XHRcdFx0XHR1cGRhdGVfZWZmZWN0KGVmZmVjdCk7XG5cblx0XHRcdFx0XHQvLyBFZmZlY3RzIHdpdGggbm8gZGVwZW5kZW5jaWVzIG9yIHRlYXJkb3duIGRvIG5vdCBnZXQgYWRkZWQgdG8gdGhlIGVmZmVjdCB0cmVlLlxuXHRcdFx0XHRcdC8vIERlZmVycmVkIGVmZmVjdHMgKGUuZy4gYCRlZmZlY3QoLi4uKWApIF9hcmVfIGFkZGVkIHRvIHRoZSB0cmVlIGJlY2F1c2Ugd2Vcblx0XHRcdFx0XHQvLyBkb24ndCBrbm93IGlmIHdlIG5lZWQgdG8ga2VlcCB0aGVtIHVudGlsIHRoZXkgYXJlIGV4ZWN1dGVkLiBEb2luZyB0aGUgY2hlY2tcblx0XHRcdFx0XHQvLyBoZXJlIChyYXRoZXIgdGhhbiBpbiBgdXBkYXRlX2VmZmVjdGApIGFsbG93cyB1cyB0byBza2lwIHRoZSB3b3JrIGZvclxuXHRcdFx0XHRcdC8vIGltbWVkaWF0ZSBlZmZlY3RzLlxuXHRcdFx0XHRcdGlmIChlZmZlY3QuZGVwcyA9PT0gbnVsbCAmJiBlZmZlY3QuZmlyc3QgPT09IG51bGwgJiYgZWZmZWN0Lm5vZGVzX3N0YXJ0ID09PSBudWxsKSB7XG5cdFx0XHRcdFx0XHRpZiAoZWZmZWN0LnRlYXJkb3duID09PSBudWxsKSB7XG5cdFx0XHRcdFx0XHRcdC8vIHJlbW92ZSB0aGlzIGVmZmVjdCBmcm9tIHRoZSBncmFwaFxuXHRcdFx0XHRcdFx0XHR1bmxpbmtfZWZmZWN0KGVmZmVjdCk7XG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHQvLyBrZWVwIHRoZSBlZmZlY3QgaW4gdGhlIGdyYXBoLCBidXQgZnJlZSB1cCBzb21lIG1lbW9yeVxuXHRcdFx0XHRcdFx0XHRlZmZlY3QuZm4gPSBudWxsO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fSBjYXRjaCAoZXJyb3IpIHtcblx0XHRcdFx0aGFuZGxlX2Vycm9yKGVycm9yLCBlZmZlY3QsIG51bGwsIGVmZmVjdC5jdHgpO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxufVxuXG5mdW5jdGlvbiBwcm9jZXNzX2RlZmVycmVkKCkge1xuXHRpc19taWNyb190YXNrX3F1ZXVlZCA9IGZhbHNlO1xuXHRpZiAoZmx1c2hfY291bnQgPiAxMDAxKSB7XG5cdFx0cmV0dXJuO1xuXHR9XG5cdGNvbnN0IHByZXZpb3VzX3F1ZXVlZF9yb290X2VmZmVjdHMgPSBxdWV1ZWRfcm9vdF9lZmZlY3RzO1xuXHRxdWV1ZWRfcm9vdF9lZmZlY3RzID0gW107XG5cdGZsdXNoX3F1ZXVlZF9yb290X2VmZmVjdHMocHJldmlvdXNfcXVldWVkX3Jvb3RfZWZmZWN0cyk7XG5cblx0aWYgKCFpc19taWNyb190YXNrX3F1ZXVlZCkge1xuXHRcdGZsdXNoX2NvdW50ID0gMDtcblx0XHRsYXN0X3NjaGVkdWxlZF9lZmZlY3QgPSBudWxsO1xuXHRcdGlmIChERVYpIHtcblx0XHRcdGRldl9lZmZlY3Rfc3RhY2sgPSBbXTtcblx0XHR9XG5cdH1cbn1cblxuLyoqXG4gKiBAcGFyYW0ge0VmZmVjdH0gc2lnbmFsXG4gKiBAcmV0dXJucyB7dm9pZH1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNjaGVkdWxlX2VmZmVjdChzaWduYWwpIHtcblx0aWYgKHNjaGVkdWxlcl9tb2RlID09PSBGTFVTSF9NSUNST1RBU0spIHtcblx0XHRpZiAoIWlzX21pY3JvX3Rhc2tfcXVldWVkKSB7XG5cdFx0XHRpc19taWNyb190YXNrX3F1ZXVlZCA9IHRydWU7XG5cdFx0XHRxdWV1ZU1pY3JvdGFzayhwcm9jZXNzX2RlZmVycmVkKTtcblx0XHR9XG5cdH1cblxuXHRsYXN0X3NjaGVkdWxlZF9lZmZlY3QgPSBzaWduYWw7XG5cblx0dmFyIGVmZmVjdCA9IHNpZ25hbDtcblxuXHR3aGlsZSAoZWZmZWN0LnBhcmVudCAhPT0gbnVsbCkge1xuXHRcdGVmZmVjdCA9IGVmZmVjdC5wYXJlbnQ7XG5cdFx0dmFyIGZsYWdzID0gZWZmZWN0LmY7XG5cblx0XHRpZiAoKGZsYWdzICYgKFJPT1RfRUZGRUNUIHwgQlJBTkNIX0VGRkVDVCkpICE9PSAwKSB7XG5cdFx0XHRpZiAoKGZsYWdzICYgQ0xFQU4pID09PSAwKSByZXR1cm47XG5cdFx0XHRlZmZlY3QuZiBePSBDTEVBTjtcblx0XHR9XG5cdH1cblxuXHRxdWV1ZWRfcm9vdF9lZmZlY3RzLnB1c2goZWZmZWN0KTtcbn1cblxuLyoqXG4gKlxuICogVGhpcyBmdW5jdGlvbiBib3RoIHJ1bnMgcmVuZGVyIGVmZmVjdHMgYW5kIGNvbGxlY3RzIHVzZXIgZWZmZWN0cyBpbiB0b3BvbG9naWNhbCBvcmRlclxuICogZnJvbSB0aGUgc3RhcnRpbmcgZWZmZWN0IHBhc3NlZCBpbi4gRWZmZWN0cyB3aWxsIGJlIGNvbGxlY3RlZCB3aGVuIHRoZXkgbWF0Y2ggdGhlIGZpbHRlcmVkXG4gKiBiaXR3aXNlIGZsYWcgcGFzc2VkIGluIG9ubHkuIFRoZSBjb2xsZWN0ZWQgZWZmZWN0cyBhcnJheSB3aWxsIGJlIHBvcHVsYXRlZCB3aXRoIGFsbCB0aGUgdXNlclxuICogZWZmZWN0cyB0byBiZSBmbHVzaGVkLlxuICpcbiAqIEBwYXJhbSB7RWZmZWN0fSBlZmZlY3RcbiAqIEBwYXJhbSB7RWZmZWN0W119IGNvbGxlY3RlZF9lZmZlY3RzXG4gKiBAcmV0dXJucyB7dm9pZH1cbiAqL1xuZnVuY3Rpb24gcHJvY2Vzc19lZmZlY3RzKGVmZmVjdCwgY29sbGVjdGVkX2VmZmVjdHMpIHtcblx0dmFyIGN1cnJlbnRfZWZmZWN0ID0gZWZmZWN0LmZpcnN0O1xuXHR2YXIgZWZmZWN0cyA9IFtdO1xuXG5cdG1haW5fbG9vcDogd2hpbGUgKGN1cnJlbnRfZWZmZWN0ICE9PSBudWxsKSB7XG5cdFx0dmFyIGZsYWdzID0gY3VycmVudF9lZmZlY3QuZjtcblx0XHR2YXIgaXNfYnJhbmNoID0gKGZsYWdzICYgQlJBTkNIX0VGRkVDVCkgIT09IDA7XG5cdFx0dmFyIGlzX3NraXBwYWJsZV9icmFuY2ggPSBpc19icmFuY2ggJiYgKGZsYWdzICYgQ0xFQU4pICE9PSAwO1xuXHRcdHZhciBzaWJsaW5nID0gY3VycmVudF9lZmZlY3QubmV4dDtcblxuXHRcdGlmICghaXNfc2tpcHBhYmxlX2JyYW5jaCAmJiAoZmxhZ3MgJiBJTkVSVCkgPT09IDApIHtcblx0XHRcdGlmICgoZmxhZ3MgJiBSRU5ERVJfRUZGRUNUKSAhPT0gMCkge1xuXHRcdFx0XHRpZiAoaXNfYnJhbmNoKSB7XG5cdFx0XHRcdFx0Y3VycmVudF9lZmZlY3QuZiBePSBDTEVBTjtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdFx0aWYgKGNoZWNrX2RpcnRpbmVzcyhjdXJyZW50X2VmZmVjdCkpIHtcblx0XHRcdFx0XHRcdFx0dXBkYXRlX2VmZmVjdChjdXJyZW50X2VmZmVjdCk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSBjYXRjaCAoZXJyb3IpIHtcblx0XHRcdFx0XHRcdGhhbmRsZV9lcnJvcihlcnJvciwgY3VycmVudF9lZmZlY3QsIG51bGwsIGN1cnJlbnRfZWZmZWN0LmN0eCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0dmFyIGNoaWxkID0gY3VycmVudF9lZmZlY3QuZmlyc3Q7XG5cblx0XHRcdFx0aWYgKGNoaWxkICE9PSBudWxsKSB7XG5cdFx0XHRcdFx0Y3VycmVudF9lZmZlY3QgPSBjaGlsZDtcblx0XHRcdFx0XHRjb250aW51ZTtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIGlmICgoZmxhZ3MgJiBFRkZFQ1QpICE9PSAwKSB7XG5cdFx0XHRcdGVmZmVjdHMucHVzaChjdXJyZW50X2VmZmVjdCk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0aWYgKHNpYmxpbmcgPT09IG51bGwpIHtcblx0XHRcdGxldCBwYXJlbnQgPSBjdXJyZW50X2VmZmVjdC5wYXJlbnQ7XG5cblx0XHRcdHdoaWxlIChwYXJlbnQgIT09IG51bGwpIHtcblx0XHRcdFx0aWYgKGVmZmVjdCA9PT0gcGFyZW50KSB7XG5cdFx0XHRcdFx0YnJlYWsgbWFpbl9sb29wO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHZhciBwYXJlbnRfc2libGluZyA9IHBhcmVudC5uZXh0O1xuXHRcdFx0XHRpZiAocGFyZW50X3NpYmxpbmcgIT09IG51bGwpIHtcblx0XHRcdFx0XHRjdXJyZW50X2VmZmVjdCA9IHBhcmVudF9zaWJsaW5nO1xuXHRcdFx0XHRcdGNvbnRpbnVlIG1haW5fbG9vcDtcblx0XHRcdFx0fVxuXHRcdFx0XHRwYXJlbnQgPSBwYXJlbnQucGFyZW50O1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGN1cnJlbnRfZWZmZWN0ID0gc2libGluZztcblx0fVxuXG5cdC8vIFdlIG1pZ2h0IGJlIGRlYWxpbmcgd2l0aCBtYW55IGVmZmVjdHMgaGVyZSwgZmFyIG1vcmUgdGhhbiBjYW4gYmUgc3ByZWFkIGludG9cblx0Ly8gYW4gYXJyYXkgcHVzaCBjYWxsIChjYWxsc3RhY2sgb3ZlcmZsb3cpLiBTbyBsZXQncyBkZWFsIHdpdGggZWFjaCBlZmZlY3QgaW4gYSBsb29wLlxuXHRmb3IgKHZhciBpID0gMDsgaSA8IGVmZmVjdHMubGVuZ3RoOyBpKyspIHtcblx0XHRjaGlsZCA9IGVmZmVjdHNbaV07XG5cdFx0Y29sbGVjdGVkX2VmZmVjdHMucHVzaChjaGlsZCk7XG5cdFx0cHJvY2Vzc19lZmZlY3RzKGNoaWxkLCBjb2xsZWN0ZWRfZWZmZWN0cyk7XG5cdH1cbn1cblxuLyoqXG4gKiBJbnRlcm5hbCB2ZXJzaW9uIG9mIGBmbHVzaFN5bmNgIHdpdGggdGhlIG9wdGlvbiB0byBub3QgZmx1c2ggcHJldmlvdXMgZWZmZWN0cy5cbiAqIFJldHVybnMgdGhlIHJlc3VsdCBvZiB0aGUgcGFzc2VkIGZ1bmN0aW9uLCBpZiBnaXZlbi5cbiAqIEBwYXJhbSB7KCkgPT4gYW55fSBbZm5dXG4gKiBAcmV0dXJucyB7YW55fVxuICovXG5leHBvcnQgZnVuY3Rpb24gZmx1c2hfc3luYyhmbikge1xuXHR2YXIgcHJldmlvdXNfc2NoZWR1bGVyX21vZGUgPSBzY2hlZHVsZXJfbW9kZTtcblx0dmFyIHByZXZpb3VzX3F1ZXVlZF9yb290X2VmZmVjdHMgPSBxdWV1ZWRfcm9vdF9lZmZlY3RzO1xuXG5cdHRyeSB7XG5cdFx0aW5maW5pdGVfbG9vcF9ndWFyZCgpO1xuXG5cdFx0LyoqIEB0eXBlIHtFZmZlY3RbXX0gKi9cblx0XHRjb25zdCByb290X2VmZmVjdHMgPSBbXTtcblxuXHRcdHNjaGVkdWxlcl9tb2RlID0gRkxVU0hfU1lOQztcblx0XHRxdWV1ZWRfcm9vdF9lZmZlY3RzID0gcm9vdF9lZmZlY3RzO1xuXHRcdGlzX21pY3JvX3Rhc2tfcXVldWVkID0gZmFsc2U7XG5cblx0XHRmbHVzaF9xdWV1ZWRfcm9vdF9lZmZlY3RzKHByZXZpb3VzX3F1ZXVlZF9yb290X2VmZmVjdHMpO1xuXG5cdFx0dmFyIHJlc3VsdCA9IGZuPy4oKTtcblxuXHRcdGZsdXNoX3Rhc2tzKCk7XG5cdFx0aWYgKHF1ZXVlZF9yb290X2VmZmVjdHMubGVuZ3RoID4gMCB8fCByb290X2VmZmVjdHMubGVuZ3RoID4gMCkge1xuXHRcdFx0Zmx1c2hfc3luYygpO1xuXHRcdH1cblxuXHRcdGZsdXNoX2NvdW50ID0gMDtcblx0XHRsYXN0X3NjaGVkdWxlZF9lZmZlY3QgPSBudWxsO1xuXHRcdGlmIChERVYpIHtcblx0XHRcdGRldl9lZmZlY3Rfc3RhY2sgPSBbXTtcblx0XHR9XG5cblx0XHRyZXR1cm4gcmVzdWx0O1xuXHR9IGZpbmFsbHkge1xuXHRcdHNjaGVkdWxlcl9tb2RlID0gcHJldmlvdXNfc2NoZWR1bGVyX21vZGU7XG5cdFx0cXVldWVkX3Jvb3RfZWZmZWN0cyA9IHByZXZpb3VzX3F1ZXVlZF9yb290X2VmZmVjdHM7XG5cdH1cbn1cblxuLyoqXG4gKiBSZXR1cm5zIGEgcHJvbWlzZSB0aGF0IHJlc29sdmVzIG9uY2UgYW55IHBlbmRpbmcgc3RhdGUgY2hhbmdlcyBoYXZlIGJlZW4gYXBwbGllZC5cbiAqIEByZXR1cm5zIHtQcm9taXNlPHZvaWQ+fVxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gdGljaygpIHtcblx0YXdhaXQgUHJvbWlzZS5yZXNvbHZlKCk7XG5cdC8vIEJ5IGNhbGxpbmcgZmx1c2hfc3luYyB3ZSBndWFyYW50ZWUgdGhhdCBhbnkgcGVuZGluZyBzdGF0ZSBjaGFuZ2VzIGFyZSBhcHBsaWVkIGFmdGVyIG9uZSB0aWNrLlxuXHQvLyBUT0RPIGxvb2sgaW50byB3aGV0aGVyIHdlIGNhbiBtYWtlIGZsdXNoaW5nIHN1YnNlcXVlbnQgdXBkYXRlcyBzeW5jaHJvbm91c2x5IGluIHRoZSBmdXR1cmUuXG5cdGZsdXNoX3N5bmMoKTtcbn1cblxuLyoqXG4gKiBAdGVtcGxhdGUgVlxuICogQHBhcmFtIHtWYWx1ZTxWPn0gc2lnbmFsXG4gKiBAcmV0dXJucyB7Vn1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldChzaWduYWwpIHtcblx0dmFyIGZsYWdzID0gc2lnbmFsLmY7XG5cdHZhciBpc19kZXJpdmVkID0gKGZsYWdzICYgREVSSVZFRCkgIT09IDA7XG5cblx0Ly8gSWYgdGhlIGRlcml2ZWQgaXMgZGVzdHJveWVkLCBqdXN0IGV4ZWN1dGUgaXQgYWdhaW4gd2l0aG91dCByZXRhaW5pbmdcblx0Ly8gaXRzIG1lbW9pc2F0aW9uIHByb3BlcnRpZXMgYXMgdGhlIGRlcml2ZWQgaXMgc3RhbGVcblx0aWYgKGlzX2Rlcml2ZWQgJiYgKGZsYWdzICYgREVTVFJPWUVEKSAhPT0gMCkge1xuXHRcdHZhciB2YWx1ZSA9IGV4ZWN1dGVfZGVyaXZlZCgvKiogQHR5cGUge0Rlcml2ZWR9ICovIChzaWduYWwpKTtcblx0XHQvLyBFbnN1cmUgdGhlIGRlcml2ZWQgcmVtYWlucyBkZXN0cm95ZWRcblx0XHRkZXN0cm95X2Rlcml2ZWQoLyoqIEB0eXBlIHtEZXJpdmVkfSAqLyAoc2lnbmFsKSk7XG5cdFx0cmV0dXJuIHZhbHVlO1xuXHR9XG5cblx0aWYgKGNhcHR1cmVkX3NpZ25hbHMgIT09IG51bGwpIHtcblx0XHRjYXB0dXJlZF9zaWduYWxzLmFkZChzaWduYWwpO1xuXHR9XG5cblx0Ly8gUmVnaXN0ZXIgdGhlIGRlcGVuZGVuY3kgb24gdGhlIGN1cnJlbnQgcmVhY3Rpb24gc2lnbmFsLlxuXHRpZiAoYWN0aXZlX3JlYWN0aW9uICE9PSBudWxsKSB7XG5cdFx0aWYgKGRlcml2ZWRfc291cmNlcyAhPT0gbnVsbCAmJiBkZXJpdmVkX3NvdXJjZXMuaW5jbHVkZXMoc2lnbmFsKSkge1xuXHRcdFx0ZS5zdGF0ZV91bnNhZmVfbG9jYWxfcmVhZCgpO1xuXHRcdH1cblx0XHR2YXIgZGVwcyA9IGFjdGl2ZV9yZWFjdGlvbi5kZXBzO1xuXG5cdFx0Ly8gSWYgdGhlIHNpZ25hbCBpcyBhY2Nlc3NpbmcgdGhlIHNhbWUgZGVwZW5kZW5jaWVzIGluIHRoZSBzYW1lXG5cdFx0Ly8gb3JkZXIgYXMgaXQgZGlkIGxhc3QgdGltZSwgaW5jcmVtZW50IGBza2lwcGVkX2RlcHNgXG5cdFx0Ly8gcmF0aGVyIHRoYW4gdXBkYXRpbmcgYG5ld19kZXBzYCwgd2hpY2ggY3JlYXRlcyBHQyBjb3N0XG5cdFx0aWYgKG5ld19kZXBzID09PSBudWxsICYmIGRlcHMgIT09IG51bGwgJiYgZGVwc1tza2lwcGVkX2RlcHNdID09PSBzaWduYWwpIHtcblx0XHRcdHNraXBwZWRfZGVwcysrO1xuXHRcdH0gZWxzZSBpZiAobmV3X2RlcHMgPT09IG51bGwpIHtcblx0XHRcdG5ld19kZXBzID0gW3NpZ25hbF07XG5cdFx0fSBlbHNlIHtcblx0XHRcdG5ld19kZXBzLnB1c2goc2lnbmFsKTtcblx0XHR9XG5cblx0XHRpZiAoXG5cdFx0XHR1bnRyYWNrZWRfd3JpdGVzICE9PSBudWxsICYmXG5cdFx0XHRhY3RpdmVfZWZmZWN0ICE9PSBudWxsICYmXG5cdFx0XHQoYWN0aXZlX2VmZmVjdC5mICYgQ0xFQU4pICE9PSAwICYmXG5cdFx0XHQoYWN0aXZlX2VmZmVjdC5mICYgQlJBTkNIX0VGRkVDVCkgPT09IDAgJiZcblx0XHRcdHVudHJhY2tlZF93cml0ZXMuaW5jbHVkZXMoc2lnbmFsKVxuXHRcdCkge1xuXHRcdFx0c2V0X3NpZ25hbF9zdGF0dXMoYWN0aXZlX2VmZmVjdCwgRElSVFkpO1xuXHRcdFx0c2NoZWR1bGVfZWZmZWN0KGFjdGl2ZV9lZmZlY3QpO1xuXHRcdH1cblx0fSBlbHNlIGlmIChpc19kZXJpdmVkICYmIC8qKiBAdHlwZSB7RGVyaXZlZH0gKi8gKHNpZ25hbCkuZGVwcyA9PT0gbnVsbCkge1xuXHRcdHZhciBkZXJpdmVkID0gLyoqIEB0eXBlIHtEZXJpdmVkfSAqLyAoc2lnbmFsKTtcblx0XHR2YXIgcGFyZW50ID0gZGVyaXZlZC5wYXJlbnQ7XG5cdFx0dmFyIHRhcmdldCA9IGRlcml2ZWQ7XG5cblx0XHR3aGlsZSAocGFyZW50ICE9PSBudWxsKSB7XG5cdFx0XHQvLyBBdHRhY2ggdGhlIGRlcml2ZWQgdG8gdGhlIG5lYXJlc3QgcGFyZW50IGVmZmVjdCwgaWYgdGhlcmUgYXJlIGRlcml2ZWRzXG5cdFx0XHQvLyBpbiBiZXR3ZWVuIHRoZW4gd2UgYWxzbyBuZWVkIHRvIGF0dGFjaCB0aGVtIHRvb1xuXHRcdFx0aWYgKChwYXJlbnQuZiAmIERFUklWRUQpICE9PSAwKSB7XG5cdFx0XHRcdHZhciBwYXJlbnRfZGVyaXZlZCA9IC8qKiBAdHlwZSB7RGVyaXZlZH0gKi8gKHBhcmVudCk7XG5cblx0XHRcdFx0dGFyZ2V0ID0gcGFyZW50X2Rlcml2ZWQ7XG5cdFx0XHRcdHBhcmVudCA9IHBhcmVudF9kZXJpdmVkLnBhcmVudDtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHZhciBwYXJlbnRfZWZmZWN0ID0gLyoqIEB0eXBlIHtFZmZlY3R9ICovIChwYXJlbnQpO1xuXG5cdFx0XHRcdGlmICghcGFyZW50X2VmZmVjdC5kZXJpdmVkcz8uaW5jbHVkZXModGFyZ2V0KSkge1xuXHRcdFx0XHRcdChwYXJlbnRfZWZmZWN0LmRlcml2ZWRzID8/PSBbXSkucHVzaCh0YXJnZXQpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdGlmIChpc19kZXJpdmVkKSB7XG5cdFx0ZGVyaXZlZCA9IC8qKiBAdHlwZSB7RGVyaXZlZH0gKi8gKHNpZ25hbCk7XG5cblx0XHRpZiAoY2hlY2tfZGlydGluZXNzKGRlcml2ZWQpKSB7XG5cdFx0XHR1cGRhdGVfZGVyaXZlZChkZXJpdmVkKTtcblx0XHR9XG5cdH1cblxuXHRpZiAoXG5cdFx0REVWICYmXG5cdFx0dHJhY2luZ19tb2RlX2ZsYWcgJiZcblx0XHR0cmFjaW5nX2V4cHJlc3Npb25zICE9PSBudWxsICYmXG5cdFx0YWN0aXZlX3JlYWN0aW9uICE9PSBudWxsICYmXG5cdFx0dHJhY2luZ19leHByZXNzaW9ucy5yZWFjdGlvbiA9PT0gYWN0aXZlX3JlYWN0aW9uXG5cdCkge1xuXHRcdC8vIFVzZWQgd2hlbiBtYXBwaW5nIHN0YXRlIGJldHdlZW4gc3BlY2lhbCBibG9ja3MgbGlrZSBgZWFjaGBcblx0XHRpZiAoc2lnbmFsLmRlYnVnKSB7XG5cdFx0XHRzaWduYWwuZGVidWcoKTtcblx0XHR9IGVsc2UgaWYgKHNpZ25hbC5jcmVhdGVkKSB7XG5cdFx0XHR2YXIgZW50cnkgPSB0cmFjaW5nX2V4cHJlc3Npb25zLmVudHJpZXMuZ2V0KHNpZ25hbCk7XG5cblx0XHRcdGlmIChlbnRyeSA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdGVudHJ5ID0geyByZWFkOiBbXSB9O1xuXHRcdFx0XHR0cmFjaW5nX2V4cHJlc3Npb25zLmVudHJpZXMuc2V0KHNpZ25hbCwgZW50cnkpO1xuXHRcdFx0fVxuXG5cdFx0XHRlbnRyeS5yZWFkLnB1c2goZ2V0X3N0YWNrKCdUcmFjZWRBdCcpKTtcblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gc2lnbmFsLnY7XG59XG5cbi8qKlxuICogTGlrZSBgZ2V0YCwgYnV0IGNoZWNrcyBmb3IgYHVuZGVmaW5lZGAuIFVzZWQgZm9yIGB2YXJgIGRlY2xhcmF0aW9ucyBiZWNhdXNlIHRoZXkgY2FuIGJlIGFjY2Vzc2VkIGJlZm9yZSBiZWluZyBkZWNsYXJlZFxuICogQHRlbXBsYXRlIFZcbiAqIEBwYXJhbSB7VmFsdWU8Vj4gfCB1bmRlZmluZWR9IHNpZ25hbFxuICogQHJldHVybnMge1YgfCB1bmRlZmluZWR9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzYWZlX2dldChzaWduYWwpIHtcblx0cmV0dXJuIHNpZ25hbCAmJiBnZXQoc2lnbmFsKTtcbn1cblxuLyoqXG4gKiBDYXB0dXJlIGFuIGFycmF5IG9mIGFsbCB0aGUgc2lnbmFscyB0aGF0IGFyZSByZWFkIHdoZW4gYGZuYCBpcyBjYWxsZWRcbiAqIEB0ZW1wbGF0ZSBUXG4gKiBAcGFyYW0geygpID0+IFR9IGZuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjYXB0dXJlX3NpZ25hbHMoZm4pIHtcblx0dmFyIHByZXZpb3VzX2NhcHR1cmVkX3NpZ25hbHMgPSBjYXB0dXJlZF9zaWduYWxzO1xuXHRjYXB0dXJlZF9zaWduYWxzID0gbmV3IFNldCgpO1xuXG5cdHZhciBjYXB0dXJlZCA9IGNhcHR1cmVkX3NpZ25hbHM7XG5cdHZhciBzaWduYWw7XG5cblx0dHJ5IHtcblx0XHR1bnRyYWNrKGZuKTtcblx0XHRpZiAocHJldmlvdXNfY2FwdHVyZWRfc2lnbmFscyAhPT0gbnVsbCkge1xuXHRcdFx0Zm9yIChzaWduYWwgb2YgY2FwdHVyZWRfc2lnbmFscykge1xuXHRcdFx0XHRwcmV2aW91c19jYXB0dXJlZF9zaWduYWxzLmFkZChzaWduYWwpO1xuXHRcdFx0fVxuXHRcdH1cblx0fSBmaW5hbGx5IHtcblx0XHRjYXB0dXJlZF9zaWduYWxzID0gcHJldmlvdXNfY2FwdHVyZWRfc2lnbmFscztcblx0fVxuXG5cdHJldHVybiBjYXB0dXJlZDtcbn1cblxuLyoqXG4gKiBJbnZva2VzIGEgZnVuY3Rpb24gYW5kIGNhcHR1cmVzIGFsbCBzaWduYWxzIHRoYXQgYXJlIHJlYWQgZHVyaW5nIHRoZSBpbnZvY2F0aW9uLFxuICogdGhlbiBpbnZhbGlkYXRlcyB0aGVtLlxuICogQHBhcmFtIHsoKSA9PiBhbnl9IGZuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpbnZhbGlkYXRlX2lubmVyX3NpZ25hbHMoZm4pIHtcblx0dmFyIGNhcHR1cmVkID0gY2FwdHVyZV9zaWduYWxzKCgpID0+IHVudHJhY2soZm4pKTtcblxuXHRmb3IgKHZhciBzaWduYWwgb2YgY2FwdHVyZWQpIHtcblx0XHQvLyBHbyBvbmUgbGV2ZWwgdXAgYmVjYXVzZSBkZXJpdmVkIHNpZ25hbHMgY3JlYXRlZCBhcyBwYXJ0IG9mIHByb3BzIGluIGxlZ2FjeSBtb2RlXG5cdFx0aWYgKChzaWduYWwuZiAmIExFR0FDWV9ERVJJVkVEX1BST1ApICE9PSAwKSB7XG5cdFx0XHRmb3IgKGNvbnN0IGRlcCBvZiAvKiogQHR5cGUge0Rlcml2ZWR9ICovIChzaWduYWwpLmRlcHMgfHwgW10pIHtcblx0XHRcdFx0aWYgKChkZXAuZiAmIERFUklWRUQpID09PSAwKSB7XG5cdFx0XHRcdFx0Ly8gVXNlIGludGVybmFsX3NldCBpbnN0ZWFkIG9mIHNldCBoZXJlIGFuZCBiZWxvdyB0byBhdm9pZCBtdXRhdGlvbiB2YWxpZGF0aW9uXG5cdFx0XHRcdFx0aW50ZXJuYWxfc2V0KGRlcCwgZGVwLnYpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdGludGVybmFsX3NldChzaWduYWwsIHNpZ25hbC52KTtcblx0XHR9XG5cdH1cbn1cblxuLyoqXG4gKiBXaGVuIHVzZWQgaW5zaWRlIGEgW2AkZGVyaXZlZGBdKGh0dHBzOi8vc3ZlbHRlLmRldi9kb2NzL3N2ZWx0ZS8kZGVyaXZlZCkgb3IgW2AkZWZmZWN0YF0oaHR0cHM6Ly9zdmVsdGUuZGV2L2RvY3Mvc3ZlbHRlLyRlZmZlY3QpLFxuICogYW55IHN0YXRlIHJlYWQgaW5zaWRlIGBmbmAgd2lsbCBub3QgYmUgdHJlYXRlZCBhcyBhIGRlcGVuZGVuY3kuXG4gKlxuICogYGBgdHNcbiAqICRlZmZlY3QoKCkgPT4ge1xuICogICAvLyB0aGlzIHdpbGwgcnVuIHdoZW4gYGRhdGFgIGNoYW5nZXMsIGJ1dCBub3Qgd2hlbiBgdGltZWAgY2hhbmdlc1xuICogICBzYXZlKGRhdGEsIHtcbiAqICAgICB0aW1lc3RhbXA6IHVudHJhY2soKCkgPT4gdGltZSlcbiAqICAgfSk7XG4gKiB9KTtcbiAqIGBgYFxuICogQHRlbXBsYXRlIFRcbiAqIEBwYXJhbSB7KCkgPT4gVH0gZm5cbiAqIEByZXR1cm5zIHtUfVxuICovXG5leHBvcnQgZnVuY3Rpb24gdW50cmFjayhmbikge1xuXHRjb25zdCBwcmV2aW91c19yZWFjdGlvbiA9IGFjdGl2ZV9yZWFjdGlvbjtcblx0dHJ5IHtcblx0XHRhY3RpdmVfcmVhY3Rpb24gPSBudWxsO1xuXHRcdHJldHVybiBmbigpO1xuXHR9IGZpbmFsbHkge1xuXHRcdGFjdGl2ZV9yZWFjdGlvbiA9IHByZXZpb3VzX3JlYWN0aW9uO1xuXHR9XG59XG5cbmNvbnN0IFNUQVRVU19NQVNLID0gfihESVJUWSB8IE1BWUJFX0RJUlRZIHwgQ0xFQU4pO1xuXG4vKipcbiAqIEBwYXJhbSB7U2lnbmFsfSBzaWduYWxcbiAqIEBwYXJhbSB7bnVtYmVyfSBzdGF0dXNcbiAqIEByZXR1cm5zIHt2b2lkfVxuICovXG5leHBvcnQgZnVuY3Rpb24gc2V0X3NpZ25hbF9zdGF0dXMoc2lnbmFsLCBzdGF0dXMpIHtcblx0c2lnbmFsLmYgPSAoc2lnbmFsLmYgJiBTVEFUVVNfTUFTSykgfCBzdGF0dXM7XG59XG5cbi8qKlxuICogUmV0cmlldmVzIHRoZSBjb250ZXh0IHRoYXQgYmVsb25ncyB0byB0aGUgY2xvc2VzdCBwYXJlbnQgY29tcG9uZW50IHdpdGggdGhlIHNwZWNpZmllZCBga2V5YC5cbiAqIE11c3QgYmUgY2FsbGVkIGR1cmluZyBjb21wb25lbnQgaW5pdGlhbGlzYXRpb24uXG4gKlxuICogQHRlbXBsYXRlIFRcbiAqIEBwYXJhbSB7YW55fSBrZXlcbiAqIEByZXR1cm5zIHtUfVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q29udGV4dChrZXkpIHtcblx0Y29uc3QgY29udGV4dF9tYXAgPSBnZXRfb3JfaW5pdF9jb250ZXh0X21hcCgnZ2V0Q29udGV4dCcpO1xuXHRjb25zdCByZXN1bHQgPSAvKiogQHR5cGUge1R9ICovIChjb250ZXh0X21hcC5nZXQoa2V5KSk7XG5cblx0aWYgKERFVikge1xuXHRcdGNvbnN0IGZuID0gLyoqIEB0eXBlIHtDb21wb25lbnRDb250ZXh0fSAqLyAoY29tcG9uZW50X2NvbnRleHQpLmZ1bmN0aW9uO1xuXHRcdGlmIChmbikge1xuXHRcdFx0YWRkX293bmVyKHJlc3VsdCwgZm4sIHRydWUpO1xuXHRcdH1cblx0fVxuXG5cdHJldHVybiByZXN1bHQ7XG59XG5cbi8qKlxuICogQXNzb2NpYXRlcyBhbiBhcmJpdHJhcnkgYGNvbnRleHRgIG9iamVjdCB3aXRoIHRoZSBjdXJyZW50IGNvbXBvbmVudCBhbmQgdGhlIHNwZWNpZmllZCBga2V5YFxuICogYW5kIHJldHVybnMgdGhhdCBvYmplY3QuIFRoZSBjb250ZXh0IGlzIHRoZW4gYXZhaWxhYmxlIHRvIGNoaWxkcmVuIG9mIHRoZSBjb21wb25lbnRcbiAqIChpbmNsdWRpbmcgc2xvdHRlZCBjb250ZW50KSB3aXRoIGBnZXRDb250ZXh0YC5cbiAqXG4gKiBMaWtlIGxpZmVjeWNsZSBmdW5jdGlvbnMsIHRoaXMgbXVzdCBiZSBjYWxsZWQgZHVyaW5nIGNvbXBvbmVudCBpbml0aWFsaXNhdGlvbi5cbiAqXG4gKiBAdGVtcGxhdGUgVFxuICogQHBhcmFtIHthbnl9IGtleVxuICogQHBhcmFtIHtUfSBjb250ZXh0XG4gKiBAcmV0dXJucyB7VH1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNldENvbnRleHQoa2V5LCBjb250ZXh0KSB7XG5cdGNvbnN0IGNvbnRleHRfbWFwID0gZ2V0X29yX2luaXRfY29udGV4dF9tYXAoJ3NldENvbnRleHQnKTtcblx0Y29udGV4dF9tYXAuc2V0KGtleSwgY29udGV4dCk7XG5cdHJldHVybiBjb250ZXh0O1xufVxuXG4vKipcbiAqIENoZWNrcyB3aGV0aGVyIGEgZ2l2ZW4gYGtleWAgaGFzIGJlZW4gc2V0IGluIHRoZSBjb250ZXh0IG9mIGEgcGFyZW50IGNvbXBvbmVudC5cbiAqIE11c3QgYmUgY2FsbGVkIGR1cmluZyBjb21wb25lbnQgaW5pdGlhbGlzYXRpb24uXG4gKlxuICogQHBhcmFtIHthbnl9IGtleVxuICogQHJldHVybnMge2Jvb2xlYW59XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBoYXNDb250ZXh0KGtleSkge1xuXHRjb25zdCBjb250ZXh0X21hcCA9IGdldF9vcl9pbml0X2NvbnRleHRfbWFwKCdoYXNDb250ZXh0Jyk7XG5cdHJldHVybiBjb250ZXh0X21hcC5oYXMoa2V5KTtcbn1cblxuLyoqXG4gKiBSZXRyaWV2ZXMgdGhlIHdob2xlIGNvbnRleHQgbWFwIHRoYXQgYmVsb25ncyB0byB0aGUgY2xvc2VzdCBwYXJlbnQgY29tcG9uZW50LlxuICogTXVzdCBiZSBjYWxsZWQgZHVyaW5nIGNvbXBvbmVudCBpbml0aWFsaXNhdGlvbi4gVXNlZnVsLCBmb3IgZXhhbXBsZSwgaWYgeW91XG4gKiBwcm9ncmFtbWF0aWNhbGx5IGNyZWF0ZSBhIGNvbXBvbmVudCBhbmQgd2FudCB0byBwYXNzIHRoZSBleGlzdGluZyBjb250ZXh0IHRvIGl0LlxuICpcbiAqIEB0ZW1wbGF0ZSB7TWFwPGFueSwgYW55Pn0gW1Q9TWFwPGFueSwgYW55Pl1cbiAqIEByZXR1cm5zIHtUfVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0QWxsQ29udGV4dHMoKSB7XG5cdGNvbnN0IGNvbnRleHRfbWFwID0gZ2V0X29yX2luaXRfY29udGV4dF9tYXAoJ2dldEFsbENvbnRleHRzJyk7XG5cblx0aWYgKERFVikge1xuXHRcdGNvbnN0IGZuID0gY29tcG9uZW50X2NvbnRleHQ/LmZ1bmN0aW9uO1xuXHRcdGlmIChmbikge1xuXHRcdFx0Zm9yIChjb25zdCB2YWx1ZSBvZiBjb250ZXh0X21hcC52YWx1ZXMoKSkge1xuXHRcdFx0XHRhZGRfb3duZXIodmFsdWUsIGZuLCB0cnVlKTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gLyoqIEB0eXBlIHtUfSAqLyAoY29udGV4dF9tYXApO1xufVxuXG4vKipcbiAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lXG4gKiBAcmV0dXJucyB7TWFwPHVua25vd24sIHVua25vd24+fVxuICovXG5mdW5jdGlvbiBnZXRfb3JfaW5pdF9jb250ZXh0X21hcChuYW1lKSB7XG5cdGlmIChjb21wb25lbnRfY29udGV4dCA9PT0gbnVsbCkge1xuXHRcdGxpZmVjeWNsZV9vdXRzaWRlX2NvbXBvbmVudChuYW1lKTtcblx0fVxuXG5cdHJldHVybiAoY29tcG9uZW50X2NvbnRleHQuYyA/Pz0gbmV3IE1hcChnZXRfcGFyZW50X2NvbnRleHQoY29tcG9uZW50X2NvbnRleHQpIHx8IHVuZGVmaW5lZCkpO1xufVxuXG4vKipcbiAqIEBwYXJhbSB7Q29tcG9uZW50Q29udGV4dH0gY29tcG9uZW50X2NvbnRleHRcbiAqIEByZXR1cm5zIHtNYXA8dW5rbm93biwgdW5rbm93bj4gfCBudWxsfVxuICovXG5mdW5jdGlvbiBnZXRfcGFyZW50X2NvbnRleHQoY29tcG9uZW50X2NvbnRleHQpIHtcblx0bGV0IHBhcmVudCA9IGNvbXBvbmVudF9jb250ZXh0LnA7XG5cdHdoaWxlIChwYXJlbnQgIT09IG51bGwpIHtcblx0XHRjb25zdCBjb250ZXh0X21hcCA9IHBhcmVudC5jO1xuXHRcdGlmIChjb250ZXh0X21hcCAhPT0gbnVsbCkge1xuXHRcdFx0cmV0dXJuIGNvbnRleHRfbWFwO1xuXHRcdH1cblx0XHRwYXJlbnQgPSBwYXJlbnQucDtcblx0fVxuXHRyZXR1cm4gbnVsbDtcbn1cblxuLyoqXG4gKiBAdGVtcGxhdGUge251bWJlciB8IGJpZ2ludH0gVFxuICogQHBhcmFtIHtWYWx1ZTxUPn0gc2lnbmFsXG4gKiBAcGFyYW0gezEgfCAtMX0gW2RdXG4gKiBAcmV0dXJucyB7VH1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHVwZGF0ZShzaWduYWwsIGQgPSAxKSB7XG5cdHZhciB2YWx1ZSA9IGdldChzaWduYWwpO1xuXHR2YXIgcmVzdWx0ID0gZCA9PT0gMSA/IHZhbHVlKysgOiB2YWx1ZS0tO1xuXG5cdHNldChzaWduYWwsIHZhbHVlKTtcblxuXHQvLyBAdHMtZXhwZWN0LWVycm9yXG5cdHJldHVybiByZXN1bHQ7XG59XG5cbi8qKlxuICogQHRlbXBsYXRlIHtudW1iZXIgfCBiaWdpbnR9IFRcbiAqIEBwYXJhbSB7VmFsdWU8VD59IHNpZ25hbFxuICogQHBhcmFtIHsxIHwgLTF9IFtkXVxuICogQHJldHVybnMge1R9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB1cGRhdGVfcHJlKHNpZ25hbCwgZCA9IDEpIHtcblx0dmFyIHZhbHVlID0gZ2V0KHNpZ25hbCk7XG5cblx0Ly8gQHRzLWV4cGVjdC1lcnJvclxuXHRyZXR1cm4gc2V0KHNpZ25hbCwgZCA9PT0gMSA/ICsrdmFsdWUgOiAtLXZhbHVlKTtcbn1cblxuLyoqXG4gKiBAcGFyYW0ge1JlY29yZDxzdHJpbmcsIHVua25vd24+fSBvYmpcbiAqIEBwYXJhbSB7c3RyaW5nW119IGtleXNcbiAqIEByZXR1cm5zIHtSZWNvcmQ8c3RyaW5nLCB1bmtub3duPn1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGV4Y2x1ZGVfZnJvbV9vYmplY3Qob2JqLCBrZXlzKSB7XG5cdC8qKiBAdHlwZSB7UmVjb3JkPHN0cmluZywgdW5rbm93bj59ICovXG5cdHZhciByZXN1bHQgPSB7fTtcblxuXHRmb3IgKHZhciBrZXkgaW4gb2JqKSB7XG5cdFx0aWYgKCFrZXlzLmluY2x1ZGVzKGtleSkpIHtcblx0XHRcdHJlc3VsdFtrZXldID0gb2JqW2tleV07XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIHJlc3VsdDtcbn1cblxuLyoqXG4gKiBAcGFyYW0ge1JlY29yZDxzdHJpbmcsIHVua25vd24+fSBwcm9wc1xuICogQHBhcmFtIHthbnl9IHJ1bmVzXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBbZm5dXG4gKiBAcmV0dXJucyB7dm9pZH1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHB1c2gocHJvcHMsIHJ1bmVzID0gZmFsc2UsIGZuKSB7XG5cdGNvbXBvbmVudF9jb250ZXh0ID0ge1xuXHRcdHA6IGNvbXBvbmVudF9jb250ZXh0LFxuXHRcdGM6IG51bGwsXG5cdFx0ZTogbnVsbCxcblx0XHRtOiBmYWxzZSxcblx0XHRzOiBwcm9wcyxcblx0XHR4OiBudWxsLFxuXHRcdGw6IG51bGxcblx0fTtcblxuXHRpZiAobGVnYWN5X21vZGVfZmxhZyAmJiAhcnVuZXMpIHtcblx0XHRjb21wb25lbnRfY29udGV4dC5sID0ge1xuXHRcdFx0czogbnVsbCxcblx0XHRcdHU6IG51bGwsXG5cdFx0XHRyMTogW10sXG5cdFx0XHRyMjogc291cmNlKGZhbHNlKVxuXHRcdH07XG5cdH1cblxuXHRpZiAoREVWKSB7XG5cdFx0Ly8gY29tcG9uZW50IGZ1bmN0aW9uXG5cdFx0Y29tcG9uZW50X2NvbnRleHQuZnVuY3Rpb24gPSBmbjtcblx0XHRkZXZfY3VycmVudF9jb21wb25lbnRfZnVuY3Rpb24gPSBmbjtcblx0fVxufVxuXG4vKipcbiAqIEB0ZW1wbGF0ZSB7UmVjb3JkPHN0cmluZywgYW55Pn0gVFxuICogQHBhcmFtIHtUfSBbY29tcG9uZW50XVxuICogQHJldHVybnMge1R9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwb3AoY29tcG9uZW50KSB7XG5cdGNvbnN0IGNvbnRleHRfc3RhY2tfaXRlbSA9IGNvbXBvbmVudF9jb250ZXh0O1xuXHRpZiAoY29udGV4dF9zdGFja19pdGVtICE9PSBudWxsKSB7XG5cdFx0aWYgKGNvbXBvbmVudCAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRjb250ZXh0X3N0YWNrX2l0ZW0ueCA9IGNvbXBvbmVudDtcblx0XHR9XG5cdFx0Y29uc3QgY29tcG9uZW50X2VmZmVjdHMgPSBjb250ZXh0X3N0YWNrX2l0ZW0uZTtcblx0XHRpZiAoY29tcG9uZW50X2VmZmVjdHMgIT09IG51bGwpIHtcblx0XHRcdHZhciBwcmV2aW91c19lZmZlY3QgPSBhY3RpdmVfZWZmZWN0O1xuXHRcdFx0dmFyIHByZXZpb3VzX3JlYWN0aW9uID0gYWN0aXZlX3JlYWN0aW9uO1xuXHRcdFx0Y29udGV4dF9zdGFja19pdGVtLmUgPSBudWxsO1xuXHRcdFx0dHJ5IHtcblx0XHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBjb21wb25lbnRfZWZmZWN0cy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRcdHZhciBjb21wb25lbnRfZWZmZWN0ID0gY29tcG9uZW50X2VmZmVjdHNbaV07XG5cdFx0XHRcdFx0c2V0X2FjdGl2ZV9lZmZlY3QoY29tcG9uZW50X2VmZmVjdC5lZmZlY3QpO1xuXHRcdFx0XHRcdHNldF9hY3RpdmVfcmVhY3Rpb24oY29tcG9uZW50X2VmZmVjdC5yZWFjdGlvbik7XG5cdFx0XHRcdFx0ZWZmZWN0KGNvbXBvbmVudF9lZmZlY3QuZm4pO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGZpbmFsbHkge1xuXHRcdFx0XHRzZXRfYWN0aXZlX2VmZmVjdChwcmV2aW91c19lZmZlY3QpO1xuXHRcdFx0XHRzZXRfYWN0aXZlX3JlYWN0aW9uKHByZXZpb3VzX3JlYWN0aW9uKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0Y29tcG9uZW50X2NvbnRleHQgPSBjb250ZXh0X3N0YWNrX2l0ZW0ucDtcblx0XHRpZiAoREVWKSB7XG5cdFx0XHRkZXZfY3VycmVudF9jb21wb25lbnRfZnVuY3Rpb24gPSBjb250ZXh0X3N0YWNrX2l0ZW0ucD8uZnVuY3Rpb24gPz8gbnVsbDtcblx0XHR9XG5cdFx0Y29udGV4dF9zdGFja19pdGVtLm0gPSB0cnVlO1xuXHR9XG5cdC8vIE1pY3JvLW9wdGltaXphdGlvbjogRG9uJ3Qgc2V0IC5hIGFib3ZlIHRvIHRoZSBlbXB0eSBvYmplY3Rcblx0Ly8gc28gaXQgY2FuIGJlIGdhcmJhZ2UtY29sbGVjdGVkIHdoZW4gdGhlIHJldHVybiBoZXJlIGlzIHVudXNlZFxuXHRyZXR1cm4gY29tcG9uZW50IHx8IC8qKiBAdHlwZSB7VH0gKi8gKHt9KTtcbn1cblxuLyoqXG4gKiBQb3NzaWJseSB0cmF2ZXJzZSBhbiBvYmplY3QgYW5kIHJlYWQgYWxsIGl0cyBwcm9wZXJ0aWVzIHNvIHRoYXQgdGhleSdyZSBhbGwgcmVhY3RpdmUgaW4gY2FzZSB0aGlzIGlzIGAkc3RhdGVgLlxuICogRG9lcyBvbmx5IGNoZWNrIGZpcnN0IGxldmVsIG9mIGFuIG9iamVjdCBmb3IgcGVyZm9ybWFuY2UgcmVhc29ucyAoaGV1cmlzdGljIHNob3VsZCBiZSBnb29kIGZvciA5OSUgb2YgYWxsIGNhc2VzKS5cbiAqIEBwYXJhbSB7YW55fSB2YWx1ZVxuICogQHJldHVybnMge3ZvaWR9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkZWVwX3JlYWRfc3RhdGUodmFsdWUpIHtcblx0aWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ29iamVjdCcgfHwgIXZhbHVlIHx8IHZhbHVlIGluc3RhbmNlb2YgRXZlbnRUYXJnZXQpIHtcblx0XHRyZXR1cm47XG5cdH1cblxuXHRpZiAoU1RBVEVfU1lNQk9MIGluIHZhbHVlKSB7XG5cdFx0ZGVlcF9yZWFkKHZhbHVlKTtcblx0fSBlbHNlIGlmICghQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcblx0XHRmb3IgKGxldCBrZXkgaW4gdmFsdWUpIHtcblx0XHRcdGNvbnN0IHByb3AgPSB2YWx1ZVtrZXldO1xuXHRcdFx0aWYgKHR5cGVvZiBwcm9wID09PSAnb2JqZWN0JyAmJiBwcm9wICYmIFNUQVRFX1NZTUJPTCBpbiBwcm9wKSB7XG5cdFx0XHRcdGRlZXBfcmVhZChwcm9wKTtcblx0XHRcdH1cblx0XHR9XG5cdH1cbn1cblxuLyoqXG4gKiBEZWVwbHkgdHJhdmVyc2UgYW4gb2JqZWN0IGFuZCByZWFkIGFsbCBpdHMgcHJvcGVydGllc1xuICogc28gdGhhdCB0aGV5J3JlIGFsbCByZWFjdGl2ZSBpbiBjYXNlIHRoaXMgaXMgYCRzdGF0ZWBcbiAqIEBwYXJhbSB7YW55fSB2YWx1ZVxuICogQHBhcmFtIHtTZXQ8YW55Pn0gdmlzaXRlZFxuICogQHJldHVybnMge3ZvaWR9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkZWVwX3JlYWQodmFsdWUsIHZpc2l0ZWQgPSBuZXcgU2V0KCkpIHtcblx0aWYgKFxuXHRcdHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiZcblx0XHR2YWx1ZSAhPT0gbnVsbCAmJlxuXHRcdC8vIFdlIGRvbid0IHdhbnQgdG8gdHJhdmVyc2UgRE9NIGVsZW1lbnRzXG5cdFx0ISh2YWx1ZSBpbnN0YW5jZW9mIEV2ZW50VGFyZ2V0KSAmJlxuXHRcdCF2aXNpdGVkLmhhcyh2YWx1ZSlcblx0KSB7XG5cdFx0dmlzaXRlZC5hZGQodmFsdWUpO1xuXHRcdC8vIFdoZW4gd29ya2luZyB3aXRoIGEgcG9zc2libGUgU3ZlbHRlRGF0ZSwgdGhpc1xuXHRcdC8vIHdpbGwgZW5zdXJlIHdlIGNhcHR1cmUgY2hhbmdlcyB0byBpdC5cblx0XHRpZiAodmFsdWUgaW5zdGFuY2VvZiBEYXRlKSB7XG5cdFx0XHR2YWx1ZS5nZXRUaW1lKCk7XG5cdFx0fVxuXHRcdGZvciAobGV0IGtleSBpbiB2YWx1ZSkge1xuXHRcdFx0dHJ5IHtcblx0XHRcdFx0ZGVlcF9yZWFkKHZhbHVlW2tleV0sIHZpc2l0ZWQpO1xuXHRcdFx0fSBjYXRjaCAoZSkge1xuXHRcdFx0XHQvLyBjb250aW51ZVxuXHRcdFx0fVxuXHRcdH1cblx0XHRjb25zdCBwcm90byA9IGdldF9wcm90b3R5cGVfb2YodmFsdWUpO1xuXHRcdGlmIChcblx0XHRcdHByb3RvICE9PSBPYmplY3QucHJvdG90eXBlICYmXG5cdFx0XHRwcm90byAhPT0gQXJyYXkucHJvdG90eXBlICYmXG5cdFx0XHRwcm90byAhPT0gTWFwLnByb3RvdHlwZSAmJlxuXHRcdFx0cHJvdG8gIT09IFNldC5wcm90b3R5cGUgJiZcblx0XHRcdHByb3RvICE9PSBEYXRlLnByb3RvdHlwZVxuXHRcdCkge1xuXHRcdFx0Y29uc3QgZGVzY3JpcHRvcnMgPSBnZXRfZGVzY3JpcHRvcnMocHJvdG8pO1xuXHRcdFx0Zm9yIChsZXQga2V5IGluIGRlc2NyaXB0b3JzKSB7XG5cdFx0XHRcdGNvbnN0IGdldCA9IGRlc2NyaXB0b3JzW2tleV0uZ2V0O1xuXHRcdFx0XHRpZiAoZ2V0KSB7XG5cdFx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRcdGdldC5jYWxsKHZhbHVlKTtcblx0XHRcdFx0XHR9IGNhdGNoIChlKSB7XG5cdFx0XHRcdFx0XHQvLyBjb250aW51ZVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fVxufVxuXG5pZiAoREVWKSB7XG5cdC8qKlxuXHQgKiBAcGFyYW0ge3N0cmluZ30gcnVuZVxuXHQgKi9cblx0ZnVuY3Rpb24gdGhyb3dfcnVuZV9lcnJvcihydW5lKSB7XG5cdFx0aWYgKCEocnVuZSBpbiBnbG9iYWxUaGlzKSkge1xuXHRcdFx0Ly8gVE9ETyBpZiBwZW9wbGUgc3RhcnQgYWRqdXN0aW5nIHRoZSBcInRoaXMgY2FuIGNvbnRhaW4gcnVuZXNcIiBjb25maWcgdGhyb3VnaCB2LXAtcyBtb3JlLCBhZGp1c3QgdGhpcyBtZXNzYWdlXG5cdFx0XHQvKiogQHR5cGUge2FueX0gKi9cblx0XHRcdGxldCB2YWx1ZTsgLy8gbGV0J3MgaG9wZSBub29uZSBtb2RpZmllcyB0aGlzIGdsb2JhbCwgYnV0IGJlbHRzIGFuZCBicmFjZXNcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShnbG9iYWxUaGlzLCBydW5lLCB7XG5cdFx0XHRcdGNvbmZpZ3VyYWJsZTogdHJ1ZSxcblx0XHRcdFx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGdldHRlci1yZXR1cm5cblx0XHRcdFx0Z2V0OiAoKSA9PiB7XG5cdFx0XHRcdFx0aWYgKHZhbHVlICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0XHRcdHJldHVybiB2YWx1ZTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRlLnJ1bmVfb3V0c2lkZV9zdmVsdGUocnVuZSk7XG5cdFx0XHRcdH0sXG5cdFx0XHRcdHNldDogKHYpID0+IHtcblx0XHRcdFx0XHR2YWx1ZSA9IHY7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH1cblx0fVxuXG5cdHRocm93X3J1bmVfZXJyb3IoJyRzdGF0ZScpO1xuXHR0aHJvd19ydW5lX2Vycm9yKCckZWZmZWN0Jyk7XG5cdHRocm93X3J1bmVfZXJyb3IoJyRkZXJpdmVkJyk7XG5cdHRocm93X3J1bmVfZXJyb3IoJyRpbnNwZWN0Jyk7XG5cdHRocm93X3J1bmVfZXJyb3IoJyRwcm9wcycpO1xuXHR0aHJvd19ydW5lX2Vycm9yKCckYmluZGFibGUnKTtcbn1cbiIsIi8qKiBAaW1wb3J0IHsgTG9jYXRpb24gfSBmcm9tICdsb2NhdGUtY2hhcmFjdGVyJyAqL1xuaW1wb3J0IHsgdGVhcmRvd24gfSBmcm9tICcuLi8uLi9yZWFjdGl2aXR5L2VmZmVjdHMuanMnO1xuaW1wb3J0IHsgZGVmaW5lX3Byb3BlcnR5LCBpc19hcnJheSB9IGZyb20gJy4uLy4uLy4uL3NoYXJlZC91dGlscy5qcyc7XG5pbXBvcnQgeyBoeWRyYXRpbmcgfSBmcm9tICcuLi9oeWRyYXRpb24uanMnO1xuaW1wb3J0IHsgcXVldWVfbWljcm9fdGFzayB9IGZyb20gJy4uL3Rhc2suanMnO1xuaW1wb3J0IHsgRklMRU5BTUUgfSBmcm9tICcuLi8uLi8uLi8uLi9jb25zdGFudHMuanMnO1xuaW1wb3J0ICogYXMgdyBmcm9tICcuLi8uLi93YXJuaW5ncy5qcyc7XG5pbXBvcnQge1xuXHRhY3RpdmVfZWZmZWN0LFxuXHRhY3RpdmVfcmVhY3Rpb24sXG5cdHNldF9hY3RpdmVfZWZmZWN0LFxuXHRzZXRfYWN0aXZlX3JlYWN0aW9uXG59IGZyb20gJy4uLy4uL3J1bnRpbWUuanMnO1xuaW1wb3J0IHsgd2l0aG91dF9yZWFjdGl2ZV9jb250ZXh0IH0gZnJvbSAnLi9iaW5kaW5ncy9zaGFyZWQuanMnO1xuXG4vKiogQHR5cGUge1NldDxzdHJpbmc+fSAqL1xuZXhwb3J0IGNvbnN0IGFsbF9yZWdpc3RlcmVkX2V2ZW50cyA9IG5ldyBTZXQoKTtcblxuLyoqIEB0eXBlIHtTZXQ8KGV2ZW50czogQXJyYXk8c3RyaW5nPikgPT4gdm9pZD59ICovXG5leHBvcnQgY29uc3Qgcm9vdF9ldmVudF9oYW5kbGVzID0gbmV3IFNldCgpO1xuXG4vKipcbiAqIFNTUiBhZGRzIG9ubG9hZCBhbmQgb25lcnJvciBhdHRyaWJ1dGVzIHRvIGNhdGNoIHRob3NlIGV2ZW50cyBiZWZvcmUgdGhlIGh5ZHJhdGlvbi5cbiAqIFRoaXMgZnVuY3Rpb24gZGV0ZWN0cyB0aG9zZSBjYXNlcywgcmVtb3ZlcyB0aGUgYXR0cmlidXRlcyBhbmQgcmVwbGF5cyB0aGUgZXZlbnRzLlxuICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZG9tXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZXBsYXlfZXZlbnRzKGRvbSkge1xuXHRpZiAoIWh5ZHJhdGluZykgcmV0dXJuO1xuXG5cdGlmIChkb20ub25sb2FkKSB7XG5cdFx0ZG9tLnJlbW92ZUF0dHJpYnV0ZSgnb25sb2FkJyk7XG5cdH1cblx0aWYgKGRvbS5vbmVycm9yKSB7XG5cdFx0ZG9tLnJlbW92ZUF0dHJpYnV0ZSgnb25lcnJvcicpO1xuXHR9XG5cdC8vIEB0cy1leHBlY3QtZXJyb3Jcblx0Y29uc3QgZXZlbnQgPSBkb20uX19lO1xuXHRpZiAoZXZlbnQgIT09IHVuZGVmaW5lZCkge1xuXHRcdC8vIEB0cy1leHBlY3QtZXJyb3Jcblx0XHRkb20uX19lID0gdW5kZWZpbmVkO1xuXHRcdHF1ZXVlTWljcm90YXNrKCgpID0+IHtcblx0XHRcdGlmIChkb20uaXNDb25uZWN0ZWQpIHtcblx0XHRcdFx0ZG9tLmRpc3BhdGNoRXZlbnQoZXZlbnQpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG59XG5cbi8qKlxuICogQHBhcmFtIHtzdHJpbmd9IGV2ZW50X25hbWVcbiAqIEBwYXJhbSB7RXZlbnRUYXJnZXR9IGRvbVxuICogQHBhcmFtIHtFdmVudExpc3RlbmVyfSBoYW5kbGVyXG4gKiBAcGFyYW0ge0FkZEV2ZW50TGlzdGVuZXJPcHRpb25zfSBvcHRpb25zXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVfZXZlbnQoZXZlbnRfbmFtZSwgZG9tLCBoYW5kbGVyLCBvcHRpb25zKSB7XG5cdC8qKlxuXHQgKiBAdGhpcyB7RXZlbnRUYXJnZXR9XG5cdCAqL1xuXHRmdW5jdGlvbiB0YXJnZXRfaGFuZGxlcigvKiogQHR5cGUge0V2ZW50fSAqLyBldmVudCkge1xuXHRcdGlmICghb3B0aW9ucy5jYXB0dXJlKSB7XG5cdFx0XHQvLyBPbmx5IGNhbGwgaW4gdGhlIGJ1YmJsZSBwaGFzZSwgZWxzZSBkZWxlZ2F0ZWQgZXZlbnRzIHdvdWxkIGJlIGNhbGxlZCBiZWZvcmUgdGhlIGNhcHR1cmluZyBldmVudHNcblx0XHRcdGhhbmRsZV9ldmVudF9wcm9wYWdhdGlvbi5jYWxsKGRvbSwgZXZlbnQpO1xuXHRcdH1cblx0XHRpZiAoIWV2ZW50LmNhbmNlbEJ1YmJsZSkge1xuXHRcdFx0cmV0dXJuIHdpdGhvdXRfcmVhY3RpdmVfY29udGV4dCgoKSA9PiB7XG5cdFx0XHRcdHJldHVybiBoYW5kbGVyLmNhbGwodGhpcywgZXZlbnQpO1xuXHRcdFx0fSk7XG5cdFx0fVxuXHR9XG5cblx0Ly8gQ2hyb21lIGhhcyBhIGJ1ZyB3aGVyZSBwb2ludGVyIGV2ZW50cyBkb24ndCB3b3JrIHdoZW4gYXR0YWNoZWQgdG8gYSBET00gZWxlbWVudCB0aGF0IGhhcyBiZWVuIGNsb25lZFxuXHQvLyB3aXRoIGNsb25lTm9kZSgpIGFuZCB0aGUgRE9NIGVsZW1lbnQgaXMgZGlzY29ubmVjdGVkIGZyb20gdGhlIGRvY3VtZW50LiBUbyBlbnN1cmUgdGhlIGV2ZW50IHdvcmtzLCB3ZVxuXHQvLyBkZWZlciB0aGUgYXR0YWNobWVudCB0aWxsIGFmdGVyIGl0J3MgYmVlbiBhcHBlbmRlZCB0byB0aGUgZG9jdW1lbnQuIFRPRE86IHJlbW92ZSB0aGlzIG9uY2UgQ2hyb21lIGZpeGVzXG5cdC8vIHRoaXMgYnVnLiBUaGUgc2FtZSBhcHBsaWVzIHRvIHdoZWVsIGV2ZW50cyBhbmQgdG91Y2ggZXZlbnRzLlxuXHRpZiAoXG5cdFx0ZXZlbnRfbmFtZS5zdGFydHNXaXRoKCdwb2ludGVyJykgfHxcblx0XHRldmVudF9uYW1lLnN0YXJ0c1dpdGgoJ3RvdWNoJykgfHxcblx0XHRldmVudF9uYW1lID09PSAnd2hlZWwnXG5cdCkge1xuXHRcdHF1ZXVlX21pY3JvX3Rhc2soKCkgPT4ge1xuXHRcdFx0ZG9tLmFkZEV2ZW50TGlzdGVuZXIoZXZlbnRfbmFtZSwgdGFyZ2V0X2hhbmRsZXIsIG9wdGlvbnMpO1xuXHRcdH0pO1xuXHR9IGVsc2Uge1xuXHRcdGRvbS5hZGRFdmVudExpc3RlbmVyKGV2ZW50X25hbWUsIHRhcmdldF9oYW5kbGVyLCBvcHRpb25zKTtcblx0fVxuXG5cdHJldHVybiB0YXJnZXRfaGFuZGxlcjtcbn1cblxuLyoqXG4gKiBBdHRhY2hlcyBhbiBldmVudCBoYW5kbGVyIHRvIGFuIGVsZW1lbnQgYW5kIHJldHVybnMgYSBmdW5jdGlvbiB0aGF0IHJlbW92ZXMgdGhlIGhhbmRsZXIuIFVzaW5nIHRoaXNcbiAqIHJhdGhlciB0aGFuIGBhZGRFdmVudExpc3RlbmVyYCB3aWxsIHByZXNlcnZlIHRoZSBjb3JyZWN0IG9yZGVyIHJlbGF0aXZlIHRvIGhhbmRsZXJzIGFkZGVkIGRlY2xhcmF0aXZlbHlcbiAqICh3aXRoIGF0dHJpYnV0ZXMgbGlrZSBgb25jbGlja2ApLCB3aGljaCB1c2UgZXZlbnQgZGVsZWdhdGlvbiBmb3IgcGVyZm9ybWFuY2UgcmVhc29uc1xuICpcbiAqIEBwYXJhbSB7RXZlbnRUYXJnZXR9IGVsZW1lbnRcbiAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlXG4gKiBAcGFyYW0ge0V2ZW50TGlzdGVuZXJ9IGhhbmRsZXJcbiAqIEBwYXJhbSB7QWRkRXZlbnRMaXN0ZW5lck9wdGlvbnN9IFtvcHRpb25zXVxuICovXG5leHBvcnQgZnVuY3Rpb24gb24oZWxlbWVudCwgdHlwZSwgaGFuZGxlciwgb3B0aW9ucyA9IHt9KSB7XG5cdHZhciB0YXJnZXRfaGFuZGxlciA9IGNyZWF0ZV9ldmVudCh0eXBlLCBlbGVtZW50LCBoYW5kbGVyLCBvcHRpb25zKTtcblxuXHRyZXR1cm4gKCkgPT4ge1xuXHRcdGVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcih0eXBlLCB0YXJnZXRfaGFuZGxlciwgb3B0aW9ucyk7XG5cdH07XG59XG5cbi8qKlxuICogQHBhcmFtIHtzdHJpbmd9IGV2ZW50X25hbWVcbiAqIEBwYXJhbSB7RWxlbWVudH0gZG9tXG4gKiBAcGFyYW0ge0V2ZW50TGlzdGVuZXJ9IGhhbmRsZXJcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gY2FwdHVyZVxuICogQHBhcmFtIHtib29sZWFufSBbcGFzc2l2ZV1cbiAqIEByZXR1cm5zIHt2b2lkfVxuICovXG5leHBvcnQgZnVuY3Rpb24gZXZlbnQoZXZlbnRfbmFtZSwgZG9tLCBoYW5kbGVyLCBjYXB0dXJlLCBwYXNzaXZlKSB7XG5cdHZhciBvcHRpb25zID0geyBjYXB0dXJlLCBwYXNzaXZlIH07XG5cdHZhciB0YXJnZXRfaGFuZGxlciA9IGNyZWF0ZV9ldmVudChldmVudF9uYW1lLCBkb20sIGhhbmRsZXIsIG9wdGlvbnMpO1xuXG5cdC8vIEB0cy1pZ25vcmVcblx0aWYgKGRvbSA9PT0gZG9jdW1lbnQuYm9keSB8fCBkb20gPT09IHdpbmRvdyB8fCBkb20gPT09IGRvY3VtZW50KSB7XG5cdFx0dGVhcmRvd24oKCkgPT4ge1xuXHRcdFx0ZG9tLnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnRfbmFtZSwgdGFyZ2V0X2hhbmRsZXIsIG9wdGlvbnMpO1xuXHRcdH0pO1xuXHR9XG59XG5cbi8qKlxuICogQHBhcmFtIHtBcnJheTxzdHJpbmc+fSBldmVudHNcbiAqIEByZXR1cm5zIHt2b2lkfVxuICovXG5leHBvcnQgZnVuY3Rpb24gZGVsZWdhdGUoZXZlbnRzKSB7XG5cdGZvciAodmFyIGkgPSAwOyBpIDwgZXZlbnRzLmxlbmd0aDsgaSsrKSB7XG5cdFx0YWxsX3JlZ2lzdGVyZWRfZXZlbnRzLmFkZChldmVudHNbaV0pO1xuXHR9XG5cblx0Zm9yICh2YXIgZm4gb2Ygcm9vdF9ldmVudF9oYW5kbGVzKSB7XG5cdFx0Zm4oZXZlbnRzKTtcblx0fVxufVxuXG4vKipcbiAqIEB0aGlzIHtFdmVudFRhcmdldH1cbiAqIEBwYXJhbSB7RXZlbnR9IGV2ZW50XG4gKiBAcmV0dXJucyB7dm9pZH1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGhhbmRsZV9ldmVudF9wcm9wYWdhdGlvbihldmVudCkge1xuXHR2YXIgaGFuZGxlcl9lbGVtZW50ID0gdGhpcztcblx0dmFyIG93bmVyX2RvY3VtZW50ID0gLyoqIEB0eXBlIHtOb2RlfSAqLyAoaGFuZGxlcl9lbGVtZW50KS5vd25lckRvY3VtZW50O1xuXHR2YXIgZXZlbnRfbmFtZSA9IGV2ZW50LnR5cGU7XG5cdHZhciBwYXRoID0gZXZlbnQuY29tcG9zZWRQYXRoPy4oKSB8fCBbXTtcblx0dmFyIGN1cnJlbnRfdGFyZ2V0ID0gLyoqIEB0eXBlIHtudWxsIHwgRWxlbWVudH0gKi8gKHBhdGhbMF0gfHwgZXZlbnQudGFyZ2V0KTtcblxuXHQvLyBjb21wb3NlZFBhdGggY29udGFpbnMgbGlzdCBvZiBub2RlcyB0aGUgZXZlbnQgaGFzIHByb3BhZ2F0ZWQgdGhyb3VnaC5cblx0Ly8gV2UgY2hlY2sgX19yb290IHRvIHNraXAgYWxsIG5vZGVzIGJlbG93IGl0IGluIGNhc2UgdGhpcyBpcyBhXG5cdC8vIHBhcmVudCBvZiB0aGUgX19yb290IG5vZGUsIHdoaWNoIGluZGljYXRlcyB0aGF0IHRoZXJlJ3MgbmVzdGVkXG5cdC8vIG1vdW50ZWQgYXBwcy4gSW4gdGhpcyBjYXNlIHdlIGRvbid0IHdhbnQgdG8gdHJpZ2dlciBldmVudHMgbXVsdGlwbGUgdGltZXMuXG5cdHZhciBwYXRoX2lkeCA9IDA7XG5cblx0Ly8gQHRzLWV4cGVjdC1lcnJvciBpcyBhZGRlZCBiZWxvd1xuXHR2YXIgaGFuZGxlZF9hdCA9IGV2ZW50Ll9fcm9vdDtcblxuXHRpZiAoaGFuZGxlZF9hdCkge1xuXHRcdHZhciBhdF9pZHggPSBwYXRoLmluZGV4T2YoaGFuZGxlZF9hdCk7XG5cdFx0aWYgKFxuXHRcdFx0YXRfaWR4ICE9PSAtMSAmJlxuXHRcdFx0KGhhbmRsZXJfZWxlbWVudCA9PT0gZG9jdW1lbnQgfHwgaGFuZGxlcl9lbGVtZW50ID09PSAvKiogQHR5cGUge2FueX0gKi8gKHdpbmRvdykpXG5cdFx0KSB7XG5cdFx0XHQvLyBUaGlzIGlzIHRoZSBmYWxsYmFjayBkb2N1bWVudCBsaXN0ZW5lciBvciBhIHdpbmRvdyBsaXN0ZW5lciwgYnV0IHRoZSBldmVudCB3YXMgYWxyZWFkeSBoYW5kbGVkXG5cdFx0XHQvLyAtPiBpZ25vcmUsIGJ1dCBzZXQgaGFuZGxlX2F0IHRvIGRvY3VtZW50L3dpbmRvdyBzbyB0aGF0IHdlJ3JlIHJlc2V0dGluZyB0aGUgZXZlbnRcblx0XHRcdC8vIGNoYWluIGluIGNhc2Ugc29tZW9uZSBtYW51YWxseSBkaXNwYXRjaGVzIHRoZSBzYW1lIGV2ZW50IG9iamVjdCBhZ2Fpbi5cblx0XHRcdC8vIEB0cy1leHBlY3QtZXJyb3Jcblx0XHRcdGV2ZW50Ll9fcm9vdCA9IGhhbmRsZXJfZWxlbWVudDtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHQvLyBXZSdyZSBkZWxpYmVyYXRlbHkgbm90IHNraXBwaW5nIGlmIHRoZSBpbmRleCBpcyBoaWdoZXIsIGJlY2F1c2Vcblx0XHQvLyBzb21lb25lIGNvdWxkIGNyZWF0ZSBhbiBldmVudCBwcm9ncmFtbWF0aWNhbGx5IGFuZCBlbWl0IGl0IG11bHRpcGxlIHRpbWVzLFxuXHRcdC8vIGluIHdoaWNoIGNhc2Ugd2Ugd2FudCB0byBoYW5kbGUgdGhlIHdob2xlIHByb3BhZ2F0aW9uIGNoYWluIHByb3Blcmx5IGVhY2ggdGltZS5cblx0XHQvLyAodGhpcyB3aWxsIG9ubHkgYmUgYSBmYWxzZSBuZWdhdGl2ZSBpZiB0aGUgZXZlbnQgaXMgZGlzcGF0Y2hlZCBtdWx0aXBsZSB0aW1lcyBhbmRcblx0XHQvLyB0aGUgZmFsbGJhY2sgZG9jdW1lbnQgbGlzdGVuZXIgaXNuJ3QgcmVhY2hlZCBpbiBiZXR3ZWVuLCBidXQgdGhhdCdzIHN1cGVyIHJhcmUpXG5cdFx0dmFyIGhhbmRsZXJfaWR4ID0gcGF0aC5pbmRleE9mKGhhbmRsZXJfZWxlbWVudCk7XG5cdFx0aWYgKGhhbmRsZXJfaWR4ID09PSAtMSkge1xuXHRcdFx0Ly8gaGFuZGxlX2lkeCBjYW4gdGhlb3JldGljYWxseSBiZSAtMSAoaGFwcGVuZWQgaW4gc29tZSBKU0RPTSB0ZXN0aW5nIHNjZW5hcmlvcyB3aXRoIGFuIGV2ZW50IGxpc3RlbmVyIG9uIHRoZSB3aW5kb3cgb2JqZWN0KVxuXHRcdFx0Ly8gc28gZ3VhcmQgYWdhaW5zdCB0aGF0LCB0b28sIGFuZCBhc3N1bWUgdGhhdCBldmVyeXRoaW5nIHdhcyBoYW5kbGVkIGF0IHRoaXMgcG9pbnQuXG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0aWYgKGF0X2lkeCA8PSBoYW5kbGVyX2lkeCkge1xuXHRcdFx0cGF0aF9pZHggPSBhdF9pZHg7XG5cdFx0fVxuXHR9XG5cblx0Y3VycmVudF90YXJnZXQgPSAvKiogQHR5cGUge0VsZW1lbnR9ICovIChwYXRoW3BhdGhfaWR4XSB8fCBldmVudC50YXJnZXQpO1xuXHQvLyB0aGVyZSBjYW4gb25seSBiZSBvbmUgZGVsZWdhdGVkIGV2ZW50IHBlciBlbGVtZW50LCBhbmQgd2UgZWl0aGVyIGFscmVhZHkgaGFuZGxlZCB0aGUgY3VycmVudCB0YXJnZXQsXG5cdC8vIG9yIHRoaXMgaXMgdGhlIHZlcnkgZmlyc3QgdGFyZ2V0IGluIHRoZSBjaGFpbiB3aGljaCBoYXMgYSBub24tZGVsZWdhdGVkIGxpc3RlbmVyLCBpbiB3aGljaCBjYXNlIGl0J3Mgc2FmZVxuXHQvLyB0byBoYW5kbGUgYSBwb3NzaWJsZSBkZWxlZ2F0ZWQgZXZlbnQgb24gaXQgbGF0ZXIgKHRocm91Z2ggdGhlIHJvb3QgZGVsZWdhdGlvbiBsaXN0ZW5lciBmb3IgZXhhbXBsZSkuXG5cdGlmIChjdXJyZW50X3RhcmdldCA9PT0gaGFuZGxlcl9lbGVtZW50KSByZXR1cm47XG5cblx0Ly8gUHJveHkgY3VycmVudFRhcmdldCB0byBjb3JyZWN0IHRhcmdldFxuXHRkZWZpbmVfcHJvcGVydHkoZXZlbnQsICdjdXJyZW50VGFyZ2V0Jywge1xuXHRcdGNvbmZpZ3VyYWJsZTogdHJ1ZSxcblx0XHRnZXQoKSB7XG5cdFx0XHRyZXR1cm4gY3VycmVudF90YXJnZXQgfHwgb3duZXJfZG9jdW1lbnQ7XG5cdFx0fVxuXHR9KTtcblxuXHQvLyBUaGlzIHN0YXJ0ZWQgYmVjYXVzZSBvZiBDaHJvbWl1bSBpc3N1ZSBodHRwczovL2Nocm9tZXN0YXR1cy5jb20vZmVhdHVyZS81MTI4Njk2ODIzNTQ1ODU2LFxuXHQvLyB3aGVyZSByZW1vdmFsIG9yIG1vdmluZyBvZiBvZiB0aGUgRE9NIGNhbiBjYXVzZSBzeW5jIGBibHVyYCBldmVudHMgdG8gZmlyZSwgd2hpY2ggY2FuIGNhdXNlIGxvZ2ljXG5cdC8vIHRvIHJ1biBpbnNpZGUgdGhlIGN1cnJlbnQgYGFjdGl2ZV9yZWFjdGlvbmAsIHdoaWNoIGlzbid0IHdoYXQgd2Ugd2FudCBhdCBhbGwuIEhvd2V2ZXIsIG9uIHJlZmxlY3Rpb24sXG5cdC8vIGl0J3MgcHJvYmFibHkgYmVzdCB0aGF0IGFsbCBldmVudCBoYW5kbGVkIGJ5IFN2ZWx0ZSBoYXZlIHRoaXMgYmVoYXZpb3VyLCBhcyB3ZSBkb24ndCByZWFsbHkgd2FudFxuXHQvLyBhbiBldmVudCBoYW5kbGVyIHRvIHJ1biBpbiB0aGUgY29udGV4dCBvZiBhbm90aGVyIHJlYWN0aW9uIG9yIGVmZmVjdC5cblx0dmFyIHByZXZpb3VzX3JlYWN0aW9uID0gYWN0aXZlX3JlYWN0aW9uO1xuXHR2YXIgcHJldmlvdXNfZWZmZWN0ID0gYWN0aXZlX2VmZmVjdDtcblx0c2V0X2FjdGl2ZV9yZWFjdGlvbihudWxsKTtcblx0c2V0X2FjdGl2ZV9lZmZlY3QobnVsbCk7XG5cblx0dHJ5IHtcblx0XHQvKipcblx0XHQgKiBAdHlwZSB7dW5rbm93bn1cblx0XHQgKi9cblx0XHR2YXIgdGhyb3dfZXJyb3I7XG5cdFx0LyoqXG5cdFx0ICogQHR5cGUge3Vua25vd25bXX1cblx0XHQgKi9cblx0XHR2YXIgb3RoZXJfZXJyb3JzID0gW107XG5cblx0XHR3aGlsZSAoY3VycmVudF90YXJnZXQgIT09IG51bGwpIHtcblx0XHRcdC8qKiBAdHlwZSB7bnVsbCB8IEVsZW1lbnR9ICovXG5cdFx0XHR2YXIgcGFyZW50X2VsZW1lbnQgPVxuXHRcdFx0XHRjdXJyZW50X3RhcmdldC5hc3NpZ25lZFNsb3QgfHxcblx0XHRcdFx0Y3VycmVudF90YXJnZXQucGFyZW50Tm9kZSB8fFxuXHRcdFx0XHQvKiogQHR5cGUge2FueX0gKi8gKGN1cnJlbnRfdGFyZ2V0KS5ob3N0IHx8XG5cdFx0XHRcdG51bGw7XG5cblx0XHRcdHRyeSB7XG5cdFx0XHRcdC8vIEB0cy1leHBlY3QtZXJyb3Jcblx0XHRcdFx0dmFyIGRlbGVnYXRlZCA9IGN1cnJlbnRfdGFyZ2V0WydfXycgKyBldmVudF9uYW1lXTtcblxuXHRcdFx0XHRpZiAoZGVsZWdhdGVkICE9PSB1bmRlZmluZWQgJiYgISgvKiogQHR5cGUge2FueX0gKi8gKGN1cnJlbnRfdGFyZ2V0KS5kaXNhYmxlZCkpIHtcblx0XHRcdFx0XHRpZiAoaXNfYXJyYXkoZGVsZWdhdGVkKSkge1xuXHRcdFx0XHRcdFx0dmFyIFtmbiwgLi4uZGF0YV0gPSBkZWxlZ2F0ZWQ7XG5cdFx0XHRcdFx0XHRmbi5hcHBseShjdXJyZW50X3RhcmdldCwgW2V2ZW50LCAuLi5kYXRhXSk7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdGRlbGVnYXRlZC5jYWxsKGN1cnJlbnRfdGFyZ2V0LCBldmVudCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9IGNhdGNoIChlcnJvcikge1xuXHRcdFx0XHRpZiAodGhyb3dfZXJyb3IpIHtcblx0XHRcdFx0XHRvdGhlcl9lcnJvcnMucHVzaChlcnJvcik7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0dGhyb3dfZXJyb3IgPSBlcnJvcjtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0aWYgKGV2ZW50LmNhbmNlbEJ1YmJsZSB8fCBwYXJlbnRfZWxlbWVudCA9PT0gaGFuZGxlcl9lbGVtZW50IHx8IHBhcmVudF9lbGVtZW50ID09PSBudWxsKSB7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0fVxuXHRcdFx0Y3VycmVudF90YXJnZXQgPSBwYXJlbnRfZWxlbWVudDtcblx0XHR9XG5cblx0XHRpZiAodGhyb3dfZXJyb3IpIHtcblx0XHRcdGZvciAobGV0IGVycm9yIG9mIG90aGVyX2Vycm9ycykge1xuXHRcdFx0XHQvLyBUaHJvdyB0aGUgcmVzdCBvZiB0aGUgZXJyb3JzLCBvbmUtYnktb25lIG9uIGEgbWljcm90YXNrXG5cdFx0XHRcdHF1ZXVlTWljcm90YXNrKCgpID0+IHtcblx0XHRcdFx0XHR0aHJvdyBlcnJvcjtcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0XHR0aHJvdyB0aHJvd19lcnJvcjtcblx0XHR9XG5cdH0gZmluYWxseSB7XG5cdFx0Ly8gQHRzLWV4cGVjdC1lcnJvciBpcyB1c2VkIGFib3ZlXG5cdFx0ZXZlbnQuX19yb290ID0gaGFuZGxlcl9lbGVtZW50O1xuXHRcdC8vIEB0cy1pZ25vcmUgcmVtb3ZlIHByb3h5IG9uIGN1cnJlbnRUYXJnZXRcblx0XHRkZWxldGUgZXZlbnQuY3VycmVudFRhcmdldDtcblx0XHRzZXRfYWN0aXZlX3JlYWN0aW9uKHByZXZpb3VzX3JlYWN0aW9uKTtcblx0XHRzZXRfYWN0aXZlX2VmZmVjdChwcmV2aW91c19lZmZlY3QpO1xuXHR9XG59XG5cbi8qKlxuICogSW4gZGV2LCB3YXJuIGlmIGFuIGV2ZW50IGhhbmRsZXIgaXMgbm90IGEgZnVuY3Rpb24sIGFzIGl0IG1lYW5zIHRoZVxuICogdXNlciBwcm9iYWJseSBjYWxsZWQgdGhlIGhhbmRsZXIgb3IgZm9yZ290IHRvIGFkZCBhIGAoKSA9PmBcbiAqIEBwYXJhbSB7KCkgPT4gKGV2ZW50OiBFdmVudCwgLi4uYXJnczogYW55KSA9PiB2b2lkfSB0aHVua1xuICogQHBhcmFtIHtFdmVudFRhcmdldH0gZWxlbWVudFxuICogQHBhcmFtIHtbRXZlbnQsIC4uLmFueV19IGFyZ3NcbiAqIEBwYXJhbSB7YW55fSBjb21wb25lbnRcbiAqIEBwYXJhbSB7W251bWJlciwgbnVtYmVyXX0gW2xvY11cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gW3JlbW92ZV9wYXJlbnNdXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhcHBseShcblx0dGh1bmssXG5cdGVsZW1lbnQsXG5cdGFyZ3MsXG5cdGNvbXBvbmVudCxcblx0bG9jLFxuXHRoYXNfc2lkZV9lZmZlY3RzID0gZmFsc2UsXG5cdHJlbW92ZV9wYXJlbnMgPSBmYWxzZVxuKSB7XG5cdGxldCBoYW5kbGVyO1xuXHRsZXQgZXJyb3I7XG5cblx0dHJ5IHtcblx0XHRoYW5kbGVyID0gdGh1bmsoKTtcblx0fSBjYXRjaCAoZSkge1xuXHRcdGVycm9yID0gZTtcblx0fVxuXG5cdGlmICh0eXBlb2YgaGFuZGxlciA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdGhhbmRsZXIuYXBwbHkoZWxlbWVudCwgYXJncyk7XG5cdH0gZWxzZSBpZiAoaGFzX3NpZGVfZWZmZWN0cyB8fCBoYW5kbGVyICE9IG51bGwgfHwgZXJyb3IpIHtcblx0XHRjb25zdCBmaWxlbmFtZSA9IGNvbXBvbmVudD8uW0ZJTEVOQU1FXTtcblx0XHRjb25zdCBsb2NhdGlvbiA9IGxvYyA/IGAgYXQgJHtmaWxlbmFtZX06JHtsb2NbMF19OiR7bG9jWzFdfWAgOiBgIGluICR7ZmlsZW5hbWV9YDtcblxuXHRcdGNvbnN0IGV2ZW50X25hbWUgPSBhcmdzWzBdLnR5cGU7XG5cdFx0Y29uc3QgZGVzY3JpcHRpb24gPSBgXFxgJHtldmVudF9uYW1lfVxcYCBoYW5kbGVyJHtsb2NhdGlvbn1gO1xuXHRcdGNvbnN0IHN1Z2dlc3Rpb24gPSByZW1vdmVfcGFyZW5zID8gJ3JlbW92ZSB0aGUgdHJhaWxpbmcgYCgpYCcgOiAnYWRkIGEgbGVhZGluZyBgKCkgPT5gJztcblxuXHRcdHcuZXZlbnRfaGFuZGxlcl9pbnZhbGlkKGRlc2NyaXB0aW9uLCBzdWdnZXN0aW9uKTtcblxuXHRcdGlmIChlcnJvcikge1xuXHRcdFx0dGhyb3cgZXJyb3I7XG5cdFx0fVxuXHR9XG59XG4iLCIvKiogQHBhcmFtIHtzdHJpbmd9IGh0bWwgKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVfZnJhZ21lbnRfZnJvbV9odG1sKGh0bWwpIHtcblx0dmFyIGVsZW0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0ZW1wbGF0ZScpO1xuXHRlbGVtLmlubmVySFRNTCA9IGh0bWw7XG5cdHJldHVybiBlbGVtLmNvbnRlbnQ7XG59XG4iLCIvKiogQGltcG9ydCB7IEVmZmVjdCwgVGVtcGxhdGVOb2RlIH0gZnJvbSAnI2NsaWVudCcgKi9cbmltcG9ydCB7IGh5ZHJhdGVfbmV4dCwgaHlkcmF0ZV9ub2RlLCBoeWRyYXRpbmcsIHNldF9oeWRyYXRlX25vZGUgfSBmcm9tICcuL2h5ZHJhdGlvbi5qcyc7XG5pbXBvcnQgeyBjcmVhdGVfdGV4dCwgZ2V0X2ZpcnN0X2NoaWxkIH0gZnJvbSAnLi9vcGVyYXRpb25zLmpzJztcbmltcG9ydCB7IGNyZWF0ZV9mcmFnbWVudF9mcm9tX2h0bWwgfSBmcm9tICcuL3JlY29uY2lsZXIuanMnO1xuaW1wb3J0IHsgYWN0aXZlX2VmZmVjdCB9IGZyb20gJy4uL3J1bnRpbWUuanMnO1xuaW1wb3J0IHsgVEVNUExBVEVfRlJBR01FTlQsIFRFTVBMQVRFX1VTRV9JTVBPUlRfTk9ERSB9IGZyb20gJy4uLy4uLy4uL2NvbnN0YW50cy5qcyc7XG5cbi8qKlxuICogQHBhcmFtIHtUZW1wbGF0ZU5vZGV9IHN0YXJ0XG4gKiBAcGFyYW0ge1RlbXBsYXRlTm9kZSB8IG51bGx9IGVuZFxuICovXG5leHBvcnQgZnVuY3Rpb24gYXNzaWduX25vZGVzKHN0YXJ0LCBlbmQpIHtcblx0dmFyIGVmZmVjdCA9IC8qKiBAdHlwZSB7RWZmZWN0fSAqLyAoYWN0aXZlX2VmZmVjdCk7XG5cdGlmIChlZmZlY3Qubm9kZXNfc3RhcnQgPT09IG51bGwpIHtcblx0XHRlZmZlY3Qubm9kZXNfc3RhcnQgPSBzdGFydDtcblx0XHRlZmZlY3Qubm9kZXNfZW5kID0gZW5kO1xuXHR9XG59XG5cbi8qKlxuICogQHBhcmFtIHtzdHJpbmd9IGNvbnRlbnRcbiAqIEBwYXJhbSB7bnVtYmVyfSBmbGFnc1xuICogQHJldHVybnMgeygpID0+IE5vZGUgfCBOb2RlW119XG4gKi9cbi8qI19fTk9fU0lERV9FRkZFQ1RTX18qL1xuZXhwb3J0IGZ1bmN0aW9uIHRlbXBsYXRlKGNvbnRlbnQsIGZsYWdzKSB7XG5cdHZhciBpc19mcmFnbWVudCA9IChmbGFncyAmIFRFTVBMQVRFX0ZSQUdNRU5UKSAhPT0gMDtcblx0dmFyIHVzZV9pbXBvcnRfbm9kZSA9IChmbGFncyAmIFRFTVBMQVRFX1VTRV9JTVBPUlRfTk9ERSkgIT09IDA7XG5cblx0LyoqIEB0eXBlIHtOb2RlfSAqL1xuXHR2YXIgbm9kZTtcblxuXHQvKipcblx0ICogV2hldGhlciBvciBub3QgdGhlIGZpcnN0IGl0ZW0gaXMgYSB0ZXh0L2VsZW1lbnQgbm9kZS4gSWYgbm90LCB3ZSBuZWVkIHRvXG5cdCAqIGNyZWF0ZSBhbiBhZGRpdGlvbmFsIGNvbW1lbnQgbm9kZSB0byBhY3QgYXMgYGVmZmVjdC5ub2Rlcy5zdGFydGBcblx0ICovXG5cdHZhciBoYXNfc3RhcnQgPSAhY29udGVudC5zdGFydHNXaXRoKCc8IT4nKTtcblxuXHRyZXR1cm4gKCkgPT4ge1xuXHRcdGlmIChoeWRyYXRpbmcpIHtcblx0XHRcdGFzc2lnbl9ub2RlcyhoeWRyYXRlX25vZGUsIG51bGwpO1xuXHRcdFx0cmV0dXJuIGh5ZHJhdGVfbm9kZTtcblx0XHR9XG5cblx0XHRpZiAobm9kZSA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRub2RlID0gY3JlYXRlX2ZyYWdtZW50X2Zyb21faHRtbChoYXNfc3RhcnQgPyBjb250ZW50IDogJzwhPicgKyBjb250ZW50KTtcblx0XHRcdGlmICghaXNfZnJhZ21lbnQpIG5vZGUgPSAvKiogQHR5cGUge05vZGV9ICovIChnZXRfZmlyc3RfY2hpbGQobm9kZSkpO1xuXHRcdH1cblxuXHRcdHZhciBjbG9uZSA9IC8qKiBAdHlwZSB7VGVtcGxhdGVOb2RlfSAqLyAoXG5cdFx0XHR1c2VfaW1wb3J0X25vZGUgPyBkb2N1bWVudC5pbXBvcnROb2RlKG5vZGUsIHRydWUpIDogbm9kZS5jbG9uZU5vZGUodHJ1ZSlcblx0XHQpO1xuXG5cdFx0aWYgKGlzX2ZyYWdtZW50KSB7XG5cdFx0XHR2YXIgc3RhcnQgPSAvKiogQHR5cGUge1RlbXBsYXRlTm9kZX0gKi8gKGdldF9maXJzdF9jaGlsZChjbG9uZSkpO1xuXHRcdFx0dmFyIGVuZCA9IC8qKiBAdHlwZSB7VGVtcGxhdGVOb2RlfSAqLyAoY2xvbmUubGFzdENoaWxkKTtcblxuXHRcdFx0YXNzaWduX25vZGVzKHN0YXJ0LCBlbmQpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRhc3NpZ25fbm9kZXMoY2xvbmUsIGNsb25lKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gY2xvbmU7XG5cdH07XG59XG5cbi8qKlxuICogQHBhcmFtIHtzdHJpbmd9IGNvbnRlbnRcbiAqIEBwYXJhbSB7bnVtYmVyfSBmbGFnc1xuICogQHJldHVybnMgeygpID0+IE5vZGUgfCBOb2RlW119XG4gKi9cbi8qI19fTk9fU0lERV9FRkZFQ1RTX18qL1xuZXhwb3J0IGZ1bmN0aW9uIHRlbXBsYXRlX3dpdGhfc2NyaXB0KGNvbnRlbnQsIGZsYWdzKSB7XG5cdHZhciBmbiA9IHRlbXBsYXRlKGNvbnRlbnQsIGZsYWdzKTtcblx0cmV0dXJuICgpID0+IHJ1bl9zY3JpcHRzKC8qKiBAdHlwZSB7RWxlbWVudCB8IERvY3VtZW50RnJhZ21lbnR9ICovIChmbigpKSk7XG59XG5cbi8qKlxuICogQHBhcmFtIHtzdHJpbmd9IGNvbnRlbnRcbiAqIEBwYXJhbSB7bnVtYmVyfSBmbGFnc1xuICogQHBhcmFtIHsnc3ZnJyB8ICdtYXRoJ30gbnNcbiAqIEByZXR1cm5zIHsoKSA9PiBOb2RlIHwgTm9kZVtdfVxuICovXG4vKiNfX05PX1NJREVfRUZGRUNUU19fKi9cbmV4cG9ydCBmdW5jdGlvbiBuc190ZW1wbGF0ZShjb250ZW50LCBmbGFncywgbnMgPSAnc3ZnJykge1xuXHQvKipcblx0ICogV2hldGhlciBvciBub3QgdGhlIGZpcnN0IGl0ZW0gaXMgYSB0ZXh0L2VsZW1lbnQgbm9kZS4gSWYgbm90LCB3ZSBuZWVkIHRvXG5cdCAqIGNyZWF0ZSBhbiBhZGRpdGlvbmFsIGNvbW1lbnQgbm9kZSB0byBhY3QgYXMgYGVmZmVjdC5ub2Rlcy5zdGFydGBcblx0ICovXG5cdHZhciBoYXNfc3RhcnQgPSAhY29udGVudC5zdGFydHNXaXRoKCc8IT4nKTtcblxuXHR2YXIgaXNfZnJhZ21lbnQgPSAoZmxhZ3MgJiBURU1QTEFURV9GUkFHTUVOVCkgIT09IDA7XG5cdHZhciB3cmFwcGVkID0gYDwke25zfT4ke2hhc19zdGFydCA/IGNvbnRlbnQgOiAnPCE+JyArIGNvbnRlbnR9PC8ke25zfT5gO1xuXG5cdC8qKiBAdHlwZSB7RWxlbWVudCB8IERvY3VtZW50RnJhZ21lbnR9ICovXG5cdHZhciBub2RlO1xuXG5cdHJldHVybiAoKSA9PiB7XG5cdFx0aWYgKGh5ZHJhdGluZykge1xuXHRcdFx0YXNzaWduX25vZGVzKGh5ZHJhdGVfbm9kZSwgbnVsbCk7XG5cdFx0XHRyZXR1cm4gaHlkcmF0ZV9ub2RlO1xuXHRcdH1cblxuXHRcdGlmICghbm9kZSkge1xuXHRcdFx0dmFyIGZyYWdtZW50ID0gLyoqIEB0eXBlIHtEb2N1bWVudEZyYWdtZW50fSAqLyAoY3JlYXRlX2ZyYWdtZW50X2Zyb21faHRtbCh3cmFwcGVkKSk7XG5cdFx0XHR2YXIgcm9vdCA9IC8qKiBAdHlwZSB7RWxlbWVudH0gKi8gKGdldF9maXJzdF9jaGlsZChmcmFnbWVudCkpO1xuXG5cdFx0XHRpZiAoaXNfZnJhZ21lbnQpIHtcblx0XHRcdFx0bm9kZSA9IGRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKTtcblx0XHRcdFx0d2hpbGUgKGdldF9maXJzdF9jaGlsZChyb290KSkge1xuXHRcdFx0XHRcdG5vZGUuYXBwZW5kQ2hpbGQoLyoqIEB0eXBlIHtOb2RlfSAqLyAoZ2V0X2ZpcnN0X2NoaWxkKHJvb3QpKSk7XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdG5vZGUgPSAvKiogQHR5cGUge0VsZW1lbnR9ICovIChnZXRfZmlyc3RfY2hpbGQocm9vdCkpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHZhciBjbG9uZSA9IC8qKiBAdHlwZSB7VGVtcGxhdGVOb2RlfSAqLyAobm9kZS5jbG9uZU5vZGUodHJ1ZSkpO1xuXG5cdFx0aWYgKGlzX2ZyYWdtZW50KSB7XG5cdFx0XHR2YXIgc3RhcnQgPSAvKiogQHR5cGUge1RlbXBsYXRlTm9kZX0gKi8gKGdldF9maXJzdF9jaGlsZChjbG9uZSkpO1xuXHRcdFx0dmFyIGVuZCA9IC8qKiBAdHlwZSB7VGVtcGxhdGVOb2RlfSAqLyAoY2xvbmUubGFzdENoaWxkKTtcblxuXHRcdFx0YXNzaWduX25vZGVzKHN0YXJ0LCBlbmQpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRhc3NpZ25fbm9kZXMoY2xvbmUsIGNsb25lKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gY2xvbmU7XG5cdH07XG59XG5cbi8qKlxuICogQHBhcmFtIHtzdHJpbmd9IGNvbnRlbnRcbiAqIEBwYXJhbSB7bnVtYmVyfSBmbGFnc1xuICogQHJldHVybnMgeygpID0+IE5vZGUgfCBOb2RlW119XG4gKi9cbi8qI19fTk9fU0lERV9FRkZFQ1RTX18qL1xuZXhwb3J0IGZ1bmN0aW9uIHN2Z190ZW1wbGF0ZV93aXRoX3NjcmlwdChjb250ZW50LCBmbGFncykge1xuXHR2YXIgZm4gPSBuc190ZW1wbGF0ZShjb250ZW50LCBmbGFncyk7XG5cdHJldHVybiAoKSA9PiBydW5fc2NyaXB0cygvKiogQHR5cGUge0VsZW1lbnQgfCBEb2N1bWVudEZyYWdtZW50fSAqLyAoZm4oKSkpO1xufVxuXG4vKipcbiAqIEBwYXJhbSB7c3RyaW5nfSBjb250ZW50XG4gKiBAcGFyYW0ge251bWJlcn0gZmxhZ3NcbiAqIEByZXR1cm5zIHsoKSA9PiBOb2RlIHwgTm9kZVtdfVxuICovXG4vKiNfX05PX1NJREVfRUZGRUNUU19fKi9cbmV4cG9ydCBmdW5jdGlvbiBtYXRobWxfdGVtcGxhdGUoY29udGVudCwgZmxhZ3MpIHtcblx0cmV0dXJuIG5zX3RlbXBsYXRlKGNvbnRlbnQsIGZsYWdzLCAnbWF0aCcpO1xufVxuXG4vKipcbiAqIENyZWF0aW5nIGEgZG9jdW1lbnQgZnJhZ21lbnQgZnJvbSBIVE1MIHRoYXQgY29udGFpbnMgc2NyaXB0IHRhZ3Mgd2lsbCBub3QgZXhlY3V0ZVxuICogdGhlIHNjcmlwdHMuIFdlIG5lZWQgdG8gcmVwbGFjZSB0aGUgc2NyaXB0IHRhZ3Mgd2l0aCBuZXcgb25lcyBzbyB0aGF0IHRoZXkgYXJlIGV4ZWN1dGVkLlxuICogQHBhcmFtIHtFbGVtZW50IHwgRG9jdW1lbnRGcmFnbWVudH0gbm9kZVxuICogQHJldHVybnMge05vZGUgfCBOb2RlW119XG4gKi9cbmZ1bmN0aW9uIHJ1bl9zY3JpcHRzKG5vZGUpIHtcblx0Ly8gc2NyaXB0cyB3ZXJlIFNTUidkLCBpbiB3aGljaCBjYXNlIHRoZXkgd2lsbCBydW5cblx0aWYgKGh5ZHJhdGluZykgcmV0dXJuIG5vZGU7XG5cblx0Y29uc3QgaXNfZnJhZ21lbnQgPSBub2RlLm5vZGVUeXBlID09PSAxMTtcblx0Y29uc3Qgc2NyaXB0cyA9XG5cdFx0LyoqIEB0eXBlIHtIVE1MRWxlbWVudH0gKi8gKG5vZGUpLnRhZ05hbWUgPT09ICdTQ1JJUFQnXG5cdFx0XHQ/IFsvKiogQHR5cGUge0hUTUxTY3JpcHRFbGVtZW50fSAqLyAobm9kZSldXG5cdFx0XHQ6IG5vZGUucXVlcnlTZWxlY3RvckFsbCgnc2NyaXB0Jyk7XG5cdGNvbnN0IGVmZmVjdCA9IC8qKiBAdHlwZSB7RWZmZWN0fSAqLyAoYWN0aXZlX2VmZmVjdCk7XG5cblx0Zm9yIChjb25zdCBzY3JpcHQgb2Ygc2NyaXB0cykge1xuXHRcdGNvbnN0IGNsb25lID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2NyaXB0Jyk7XG5cdFx0Zm9yICh2YXIgYXR0cmlidXRlIG9mIHNjcmlwdC5hdHRyaWJ1dGVzKSB7XG5cdFx0XHRjbG9uZS5zZXRBdHRyaWJ1dGUoYXR0cmlidXRlLm5hbWUsIGF0dHJpYnV0ZS52YWx1ZSk7XG5cdFx0fVxuXG5cdFx0Y2xvbmUudGV4dENvbnRlbnQgPSBzY3JpcHQudGV4dENvbnRlbnQ7XG5cblx0XHQvLyBUaGUgc2NyaXB0IGhhcyBjaGFuZ2VkIC0gaWYgaXQncyBhdCB0aGUgZWRnZXMsIHRoZSBlZmZlY3Qgbm93IHBvaW50cyBhdCBkZWFkIG5vZGVzXG5cdFx0aWYgKGlzX2ZyYWdtZW50ID8gbm9kZS5maXJzdENoaWxkID09PSBzY3JpcHQgOiBub2RlID09PSBzY3JpcHQpIHtcblx0XHRcdGVmZmVjdC5ub2Rlc19zdGFydCA9IGNsb25lO1xuXHRcdH1cblx0XHRpZiAoaXNfZnJhZ21lbnQgPyBub2RlLmxhc3RDaGlsZCA9PT0gc2NyaXB0IDogbm9kZSA9PT0gc2NyaXB0KSB7XG5cdFx0XHRlZmZlY3Qubm9kZXNfZW5kID0gY2xvbmU7XG5cdFx0fVxuXG5cdFx0c2NyaXB0LnJlcGxhY2VXaXRoKGNsb25lKTtcblx0fVxuXHRyZXR1cm4gbm9kZTtcbn1cblxuLyoqXG4gKiBEb24ndCBtYXJrIHRoaXMgYXMgc2lkZS1lZmZlY3QtZnJlZSwgaHlkcmF0aW9uIG5lZWRzIHRvIHdhbGsgYWxsIG5vZGVzXG4gKiBAcGFyYW0ge2FueX0gdmFsdWVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRleHQodmFsdWUgPSAnJykge1xuXHRpZiAoIWh5ZHJhdGluZykge1xuXHRcdHZhciB0ID0gY3JlYXRlX3RleHQodmFsdWUgKyAnJyk7XG5cdFx0YXNzaWduX25vZGVzKHQsIHQpO1xuXHRcdHJldHVybiB0O1xuXHR9XG5cblx0dmFyIG5vZGUgPSBoeWRyYXRlX25vZGU7XG5cblx0aWYgKG5vZGUubm9kZVR5cGUgIT09IDMpIHtcblx0XHQvLyBpZiBhbiB7ZXhwcmVzc2lvbn0gaXMgZW1wdHkgZHVyaW5nIFNTUiwgd2UgbmVlZCB0byBpbnNlcnQgYW4gZW1wdHkgdGV4dCBub2RlXG5cdFx0bm9kZS5iZWZvcmUoKG5vZGUgPSBjcmVhdGVfdGV4dCgpKSk7XG5cdFx0c2V0X2h5ZHJhdGVfbm9kZShub2RlKTtcblx0fVxuXG5cdGFzc2lnbl9ub2Rlcyhub2RlLCBub2RlKTtcblx0cmV0dXJuIG5vZGU7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjb21tZW50KCkge1xuXHQvLyB3ZSdyZSBub3QgZGVsZWdhdGluZyB0byBgdGVtcGxhdGVgIGhlcmUgZm9yIHBlcmZvcm1hbmNlIHJlYXNvbnNcblx0aWYgKGh5ZHJhdGluZykge1xuXHRcdGFzc2lnbl9ub2RlcyhoeWRyYXRlX25vZGUsIG51bGwpO1xuXHRcdHJldHVybiBoeWRyYXRlX25vZGU7XG5cdH1cblxuXHR2YXIgZnJhZyA9IGRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKTtcblx0dmFyIHN0YXJ0ID0gZG9jdW1lbnQuY3JlYXRlQ29tbWVudCgnJyk7XG5cdHZhciBhbmNob3IgPSBjcmVhdGVfdGV4dCgpO1xuXHRmcmFnLmFwcGVuZChzdGFydCwgYW5jaG9yKTtcblxuXHRhc3NpZ25fbm9kZXMoc3RhcnQsIGFuY2hvcik7XG5cblx0cmV0dXJuIGZyYWc7XG59XG5cbi8qKlxuICogQXNzaWduIHRoZSBjcmVhdGVkIChvciBpbiBoeWRyYXRpb24gbW9kZSwgdHJhdmVyc2VkKSBkb20gZWxlbWVudHMgdG8gdGhlIGN1cnJlbnQgYmxvY2tcbiAqIGFuZCBpbnNlcnQgdGhlIGVsZW1lbnRzIGludG8gdGhlIGRvbSAoaW4gY2xpZW50IG1vZGUpLlxuICogQHBhcmFtIHtUZXh0IHwgQ29tbWVudCB8IEVsZW1lbnR9IGFuY2hvclxuICogQHBhcmFtIHtEb2N1bWVudEZyYWdtZW50IHwgRWxlbWVudH0gZG9tXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhcHBlbmQoYW5jaG9yLCBkb20pIHtcblx0aWYgKGh5ZHJhdGluZykge1xuXHRcdC8qKiBAdHlwZSB7RWZmZWN0fSAqLyAoYWN0aXZlX2VmZmVjdCkubm9kZXNfZW5kID0gaHlkcmF0ZV9ub2RlO1xuXHRcdGh5ZHJhdGVfbmV4dCgpO1xuXHRcdHJldHVybjtcblx0fVxuXG5cdGlmIChhbmNob3IgPT09IG51bGwpIHtcblx0XHQvLyBlZGdlIGNhc2Ug4oCUIHZvaWQgYDxzdmVsdGU6ZWxlbWVudD5gIHdpdGggY29udGVudFxuXHRcdHJldHVybjtcblx0fVxuXG5cdGFuY2hvci5iZWZvcmUoLyoqIEB0eXBlIHtOb2RlfSAqLyAoZG9tKSk7XG59XG4iLCIvKiogQGltcG9ydCB7IENvbXBvbmVudENvbnRleHQsIEVmZmVjdCwgVGVtcGxhdGVOb2RlIH0gZnJvbSAnI2NsaWVudCcgKi9cbi8qKiBAaW1wb3J0IHsgQ29tcG9uZW50LCBDb21wb25lbnRUeXBlLCBTdmVsdGVDb21wb25lbnQsIE1vdW50T3B0aW9ucyB9IGZyb20gJy4uLy4uL2luZGV4LmpzJyAqL1xuaW1wb3J0IHsgREVWIH0gZnJvbSAnZXNtLWVudic7XG5pbXBvcnQge1xuXHRjbGVhcl90ZXh0X2NvbnRlbnQsXG5cdGNyZWF0ZV90ZXh0LFxuXHRnZXRfZmlyc3RfY2hpbGQsXG5cdGdldF9uZXh0X3NpYmxpbmcsXG5cdGluaXRfb3BlcmF0aW9uc1xufSBmcm9tICcuL2RvbS9vcGVyYXRpb25zLmpzJztcbmltcG9ydCB7IEhZRFJBVElPTl9FTkQsIEhZRFJBVElPTl9FUlJPUiwgSFlEUkFUSU9OX1NUQVJUIH0gZnJvbSAnLi4vLi4vY29uc3RhbnRzLmpzJztcbmltcG9ydCB7IHB1c2gsIHBvcCwgY29tcG9uZW50X2NvbnRleHQsIGFjdGl2ZV9lZmZlY3QgfSBmcm9tICcuL3J1bnRpbWUuanMnO1xuaW1wb3J0IHsgY29tcG9uZW50X3Jvb3QsIGJyYW5jaCB9IGZyb20gJy4vcmVhY3Rpdml0eS9lZmZlY3RzLmpzJztcbmltcG9ydCB7XG5cdGh5ZHJhdGVfbmV4dCxcblx0aHlkcmF0ZV9ub2RlLFxuXHRoeWRyYXRpbmcsXG5cdHNldF9oeWRyYXRlX25vZGUsXG5cdHNldF9oeWRyYXRpbmdcbn0gZnJvbSAnLi9kb20vaHlkcmF0aW9uLmpzJztcbmltcG9ydCB7IGFycmF5X2Zyb20gfSBmcm9tICcuLi9zaGFyZWQvdXRpbHMuanMnO1xuaW1wb3J0IHtcblx0YWxsX3JlZ2lzdGVyZWRfZXZlbnRzLFxuXHRoYW5kbGVfZXZlbnRfcHJvcGFnYXRpb24sXG5cdHJvb3RfZXZlbnRfaGFuZGxlc1xufSBmcm9tICcuL2RvbS9lbGVtZW50cy9ldmVudHMuanMnO1xuaW1wb3J0IHsgcmVzZXRfaGVhZF9hbmNob3IgfSBmcm9tICcuL2RvbS9ibG9ja3Mvc3ZlbHRlLWhlYWQuanMnO1xuaW1wb3J0ICogYXMgdyBmcm9tICcuL3dhcm5pbmdzLmpzJztcbmltcG9ydCAqIGFzIGUgZnJvbSAnLi9lcnJvcnMuanMnO1xuaW1wb3J0IHsgYXNzaWduX25vZGVzIH0gZnJvbSAnLi9kb20vdGVtcGxhdGUuanMnO1xuaW1wb3J0IHsgaXNfcGFzc2l2ZV9ldmVudCB9IGZyb20gJy4uLy4uL3V0aWxzLmpzJztcblxuLyoqXG4gKiBUaGlzIGlzIG5vcm1hbGx5IHRydWUg4oCUIGJsb2NrIGVmZmVjdHMgc2hvdWxkIHJ1biB0aGVpciBpbnRybyB0cmFuc2l0aW9ucyDigJRcbiAqIGJ1dCBpcyBmYWxzZSBkdXJpbmcgaHlkcmF0aW9uICh1bmxlc3MgYG9wdGlvbnMuaW50cm9gIGlzIGB0cnVlYCkgYW5kXG4gKiB3aGVuIGNyZWF0aW5nIHRoZSBjaGlsZHJlbiBvZiBhIGA8c3ZlbHRlOmVsZW1lbnQ+YCB0aGF0IGp1c3QgY2hhbmdlZCB0YWdcbiAqL1xuZXhwb3J0IGxldCBzaG91bGRfaW50cm8gPSB0cnVlO1xuXG4vKiogQHBhcmFtIHtib29sZWFufSB2YWx1ZSAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNldF9zaG91bGRfaW50cm8odmFsdWUpIHtcblx0c2hvdWxkX2ludHJvID0gdmFsdWU7XG59XG5cbi8qKlxuICogQHBhcmFtIHtFbGVtZW50fSB0ZXh0XG4gKiBAcGFyYW0ge3N0cmluZ30gdmFsdWVcbiAqIEByZXR1cm5zIHt2b2lkfVxuICovXG5leHBvcnQgZnVuY3Rpb24gc2V0X3RleHQodGV4dCwgdmFsdWUpIHtcblx0Ly8gRm9yIG9iamVjdHMsIHdlIGFwcGx5IHN0cmluZyBjb2VyY2lvbiAod2hpY2ggbWlnaHQgbWFrZSB0aGluZ3MgbGlrZSAkc3RhdGUgYXJyYXkgcmVmZXJlbmNlcyBpbiB0aGUgdGVtcGxhdGUgcmVhY3RpdmUpIGJlZm9yZSBkaWZmaW5nXG5cdHZhciBzdHIgPSB2YWx1ZSA9PSBudWxsID8gJycgOiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnID8gdmFsdWUgKyAnJyA6IHZhbHVlO1xuXHQvLyBAdHMtZXhwZWN0LWVycm9yXG5cdGlmIChzdHIgIT09ICh0ZXh0Ll9fdCA/Pz0gdGV4dC5ub2RlVmFsdWUpKSB7XG5cdFx0Ly8gQHRzLWV4cGVjdC1lcnJvclxuXHRcdHRleHQuX190ID0gc3RyO1xuXHRcdHRleHQubm9kZVZhbHVlID0gc3RyID09IG51bGwgPyAnJyA6IHN0ciArICcnO1xuXHR9XG59XG5cbi8qKlxuICogTW91bnRzIGEgY29tcG9uZW50IHRvIHRoZSBnaXZlbiB0YXJnZXQgYW5kIHJldHVybnMgdGhlIGV4cG9ydHMgYW5kIHBvdGVudGlhbGx5IHRoZSBwcm9wcyAoaWYgY29tcGlsZWQgd2l0aCBgYWNjZXNzb3JzOiB0cnVlYCkgb2YgdGhlIGNvbXBvbmVudC5cbiAqIFRyYW5zaXRpb25zIHdpbGwgcGxheSBkdXJpbmcgdGhlIGluaXRpYWwgcmVuZGVyIHVubGVzcyB0aGUgYGludHJvYCBvcHRpb24gaXMgc2V0IHRvIGBmYWxzZWAuXG4gKlxuICogQHRlbXBsYXRlIHtSZWNvcmQ8c3RyaW5nLCBhbnk+fSBQcm9wc1xuICogQHRlbXBsYXRlIHtSZWNvcmQ8c3RyaW5nLCBhbnk+fSBFeHBvcnRzXG4gKiBAcGFyYW0ge0NvbXBvbmVudFR5cGU8U3ZlbHRlQ29tcG9uZW50PFByb3BzPj4gfCBDb21wb25lbnQ8UHJvcHMsIEV4cG9ydHMsIGFueT59IGNvbXBvbmVudFxuICogQHBhcmFtIHtNb3VudE9wdGlvbnM8UHJvcHM+fSBvcHRpb25zXG4gKiBAcmV0dXJucyB7RXhwb3J0c31cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1vdW50KGNvbXBvbmVudCwgb3B0aW9ucykge1xuXHRyZXR1cm4gX21vdW50KGNvbXBvbmVudCwgb3B0aW9ucyk7XG59XG5cbi8qKlxuICogSHlkcmF0ZXMgYSBjb21wb25lbnQgb24gdGhlIGdpdmVuIHRhcmdldCBhbmQgcmV0dXJucyB0aGUgZXhwb3J0cyBhbmQgcG90ZW50aWFsbHkgdGhlIHByb3BzIChpZiBjb21waWxlZCB3aXRoIGBhY2Nlc3NvcnM6IHRydWVgKSBvZiB0aGUgY29tcG9uZW50XG4gKlxuICogQHRlbXBsYXRlIHtSZWNvcmQ8c3RyaW5nLCBhbnk+fSBQcm9wc1xuICogQHRlbXBsYXRlIHtSZWNvcmQ8c3RyaW5nLCBhbnk+fSBFeHBvcnRzXG4gKiBAcGFyYW0ge0NvbXBvbmVudFR5cGU8U3ZlbHRlQ29tcG9uZW50PFByb3BzPj4gfCBDb21wb25lbnQ8UHJvcHMsIEV4cG9ydHMsIGFueT59IGNvbXBvbmVudFxuICogQHBhcmFtIHt7fSBleHRlbmRzIFByb3BzID8ge1xuICogXHRcdHRhcmdldDogRG9jdW1lbnQgfCBFbGVtZW50IHwgU2hhZG93Um9vdDtcbiAqIFx0XHRwcm9wcz86IFByb3BzO1xuICogXHRcdGV2ZW50cz86IFJlY29yZDxzdHJpbmcsIChlOiBhbnkpID0+IGFueT47XG4gKiAgXHRjb250ZXh0PzogTWFwPGFueSwgYW55PjtcbiAqIFx0XHRpbnRybz86IGJvb2xlYW47XG4gKiBcdFx0cmVjb3Zlcj86IGJvb2xlYW47XG4gKiBcdH0gOiB7XG4gKiBcdFx0dGFyZ2V0OiBEb2N1bWVudCB8IEVsZW1lbnQgfCBTaGFkb3dSb290O1xuICogXHRcdHByb3BzOiBQcm9wcztcbiAqIFx0XHRldmVudHM/OiBSZWNvcmQ8c3RyaW5nLCAoZTogYW55KSA9PiBhbnk+O1xuICogIFx0Y29udGV4dD86IE1hcDxhbnksIGFueT47XG4gKiBcdFx0aW50cm8/OiBib29sZWFuO1xuICogXHRcdHJlY292ZXI/OiBib29sZWFuO1xuICogXHR9fSBvcHRpb25zXG4gKiBAcmV0dXJucyB7RXhwb3J0c31cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGh5ZHJhdGUoY29tcG9uZW50LCBvcHRpb25zKSB7XG5cdGluaXRfb3BlcmF0aW9ucygpO1xuXHRvcHRpb25zLmludHJvID0gb3B0aW9ucy5pbnRybyA/PyBmYWxzZTtcblx0Y29uc3QgdGFyZ2V0ID0gb3B0aW9ucy50YXJnZXQ7XG5cdGNvbnN0IHdhc19oeWRyYXRpbmcgPSBoeWRyYXRpbmc7XG5cdGNvbnN0IHByZXZpb3VzX2h5ZHJhdGVfbm9kZSA9IGh5ZHJhdGVfbm9kZTtcblxuXHR0cnkge1xuXHRcdHZhciBhbmNob3IgPSAvKiogQHR5cGUge1RlbXBsYXRlTm9kZX0gKi8gKGdldF9maXJzdF9jaGlsZCh0YXJnZXQpKTtcblx0XHR3aGlsZSAoXG5cdFx0XHRhbmNob3IgJiZcblx0XHRcdChhbmNob3Iubm9kZVR5cGUgIT09IDggfHwgLyoqIEB0eXBlIHtDb21tZW50fSAqLyAoYW5jaG9yKS5kYXRhICE9PSBIWURSQVRJT05fU1RBUlQpXG5cdFx0KSB7XG5cdFx0XHRhbmNob3IgPSAvKiogQHR5cGUge1RlbXBsYXRlTm9kZX0gKi8gKGdldF9uZXh0X3NpYmxpbmcoYW5jaG9yKSk7XG5cdFx0fVxuXG5cdFx0aWYgKCFhbmNob3IpIHtcblx0XHRcdHRocm93IEhZRFJBVElPTl9FUlJPUjtcblx0XHR9XG5cblx0XHRzZXRfaHlkcmF0aW5nKHRydWUpO1xuXHRcdHNldF9oeWRyYXRlX25vZGUoLyoqIEB0eXBlIHtDb21tZW50fSAqLyAoYW5jaG9yKSk7XG5cdFx0aHlkcmF0ZV9uZXh0KCk7XG5cblx0XHRjb25zdCBpbnN0YW5jZSA9IF9tb3VudChjb21wb25lbnQsIHsgLi4ub3B0aW9ucywgYW5jaG9yIH0pO1xuXG5cdFx0aWYgKFxuXHRcdFx0aHlkcmF0ZV9ub2RlID09PSBudWxsIHx8XG5cdFx0XHRoeWRyYXRlX25vZGUubm9kZVR5cGUgIT09IDggfHxcblx0XHRcdC8qKiBAdHlwZSB7Q29tbWVudH0gKi8gKGh5ZHJhdGVfbm9kZSkuZGF0YSAhPT0gSFlEUkFUSU9OX0VORFxuXHRcdCkge1xuXHRcdFx0dy5oeWRyYXRpb25fbWlzbWF0Y2goKTtcblx0XHRcdHRocm93IEhZRFJBVElPTl9FUlJPUjtcblx0XHR9XG5cblx0XHRzZXRfaHlkcmF0aW5nKGZhbHNlKTtcblxuXHRcdHJldHVybiAvKiogIEB0eXBlIHtFeHBvcnRzfSAqLyAoaW5zdGFuY2UpO1xuXHR9IGNhdGNoIChlcnJvcikge1xuXHRcdGlmIChlcnJvciA9PT0gSFlEUkFUSU9OX0VSUk9SKSB7XG5cdFx0XHRpZiAob3B0aW9ucy5yZWNvdmVyID09PSBmYWxzZSkge1xuXHRcdFx0XHRlLmh5ZHJhdGlvbl9mYWlsZWQoKTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gSWYgYW4gZXJyb3Igb2NjdXJlZCBhYm92ZSwgdGhlIG9wZXJhdGlvbnMgbWlnaHQgbm90IHlldCBoYXZlIGJlZW4gaW5pdGlhbGlzZWQuXG5cdFx0XHRpbml0X29wZXJhdGlvbnMoKTtcblx0XHRcdGNsZWFyX3RleHRfY29udGVudCh0YXJnZXQpO1xuXG5cdFx0XHRzZXRfaHlkcmF0aW5nKGZhbHNlKTtcblx0XHRcdHJldHVybiBtb3VudChjb21wb25lbnQsIG9wdGlvbnMpO1xuXHRcdH1cblxuXHRcdHRocm93IGVycm9yO1xuXHR9IGZpbmFsbHkge1xuXHRcdHNldF9oeWRyYXRpbmcod2FzX2h5ZHJhdGluZyk7XG5cdFx0c2V0X2h5ZHJhdGVfbm9kZShwcmV2aW91c19oeWRyYXRlX25vZGUpO1xuXHRcdHJlc2V0X2hlYWRfYW5jaG9yKCk7XG5cdH1cbn1cblxuLyoqIEB0eXBlIHtNYXA8c3RyaW5nLCBudW1iZXI+fSAqL1xuY29uc3QgZG9jdW1lbnRfbGlzdGVuZXJzID0gbmV3IE1hcCgpO1xuXG4vKipcbiAqIEB0ZW1wbGF0ZSB7UmVjb3JkPHN0cmluZywgYW55Pn0gRXhwb3J0c1xuICogQHBhcmFtIHtDb21wb25lbnRUeXBlPFN2ZWx0ZUNvbXBvbmVudDxhbnk+PiB8IENvbXBvbmVudDxhbnk+fSBDb21wb25lbnRcbiAqIEBwYXJhbSB7TW91bnRPcHRpb25zfSBvcHRpb25zXG4gKiBAcmV0dXJucyB7RXhwb3J0c31cbiAqL1xuZnVuY3Rpb24gX21vdW50KENvbXBvbmVudCwgeyB0YXJnZXQsIGFuY2hvciwgcHJvcHMgPSB7fSwgZXZlbnRzLCBjb250ZXh0LCBpbnRybyA9IHRydWUgfSkge1xuXHRpbml0X29wZXJhdGlvbnMoKTtcblxuXHR2YXIgcmVnaXN0ZXJlZF9ldmVudHMgPSBuZXcgU2V0KCk7XG5cblx0LyoqIEBwYXJhbSB7QXJyYXk8c3RyaW5nPn0gZXZlbnRzICovXG5cdHZhciBldmVudF9oYW5kbGUgPSAoZXZlbnRzKSA9PiB7XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBldmVudHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdHZhciBldmVudF9uYW1lID0gZXZlbnRzW2ldO1xuXG5cdFx0XHRpZiAocmVnaXN0ZXJlZF9ldmVudHMuaGFzKGV2ZW50X25hbWUpKSBjb250aW51ZTtcblx0XHRcdHJlZ2lzdGVyZWRfZXZlbnRzLmFkZChldmVudF9uYW1lKTtcblxuXHRcdFx0dmFyIHBhc3NpdmUgPSBpc19wYXNzaXZlX2V2ZW50KGV2ZW50X25hbWUpO1xuXG5cdFx0XHQvLyBBZGQgdGhlIGV2ZW50IGxpc3RlbmVyIHRvIGJvdGggdGhlIGNvbnRhaW5lciBhbmQgdGhlIGRvY3VtZW50LlxuXHRcdFx0Ly8gVGhlIGNvbnRhaW5lciBsaXN0ZW5lciBlbnN1cmVzIHdlIGNhdGNoIGV2ZW50cyBmcm9tIHdpdGhpbiBpbiBjYXNlXG5cdFx0XHQvLyB0aGUgb3V0ZXIgY29udGVudCBzdG9wcyBwcm9wYWdhdGlvbiBvZiB0aGUgZXZlbnQuXG5cdFx0XHR0YXJnZXQuYWRkRXZlbnRMaXN0ZW5lcihldmVudF9uYW1lLCBoYW5kbGVfZXZlbnRfcHJvcGFnYXRpb24sIHsgcGFzc2l2ZSB9KTtcblxuXHRcdFx0dmFyIG4gPSBkb2N1bWVudF9saXN0ZW5lcnMuZ2V0KGV2ZW50X25hbWUpO1xuXG5cdFx0XHRpZiAobiA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdC8vIFRoZSBkb2N1bWVudCBsaXN0ZW5lciBlbnN1cmVzIHdlIGNhdGNoIGV2ZW50cyB0aGF0IG9yaWdpbmF0ZSBmcm9tIGVsZW1lbnRzIHRoYXQgd2VyZVxuXHRcdFx0XHQvLyBtYW51YWxseSBtb3ZlZCBvdXRzaWRlIG9mIHRoZSBjb250YWluZXIgKGUuZy4gdmlhIG1hbnVhbCBwb3J0YWxzKS5cblx0XHRcdFx0ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihldmVudF9uYW1lLCBoYW5kbGVfZXZlbnRfcHJvcGFnYXRpb24sIHsgcGFzc2l2ZSB9KTtcblx0XHRcdFx0ZG9jdW1lbnRfbGlzdGVuZXJzLnNldChldmVudF9uYW1lLCAxKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGRvY3VtZW50X2xpc3RlbmVycy5zZXQoZXZlbnRfbmFtZSwgbiArIDEpO1xuXHRcdFx0fVxuXHRcdH1cblx0fTtcblxuXHRldmVudF9oYW5kbGUoYXJyYXlfZnJvbShhbGxfcmVnaXN0ZXJlZF9ldmVudHMpKTtcblx0cm9vdF9ldmVudF9oYW5kbGVzLmFkZChldmVudF9oYW5kbGUpO1xuXG5cdC8qKiBAdHlwZSB7RXhwb3J0c30gKi9cblx0Ly8gQHRzLWV4cGVjdC1lcnJvciB3aWxsIGJlIGRlZmluZWQgYmVjYXVzZSB0aGUgcmVuZGVyIGVmZmVjdCBydW5zIHN5bmNocm9ub3VzbHlcblx0dmFyIGNvbXBvbmVudCA9IHVuZGVmaW5lZDtcblxuXHR2YXIgdW5tb3VudCA9IGNvbXBvbmVudF9yb290KCgpID0+IHtcblx0XHR2YXIgYW5jaG9yX25vZGUgPSBhbmNob3IgPz8gdGFyZ2V0LmFwcGVuZENoaWxkKGNyZWF0ZV90ZXh0KCkpO1xuXG5cdFx0YnJhbmNoKCgpID0+IHtcblx0XHRcdGlmIChjb250ZXh0KSB7XG5cdFx0XHRcdHB1c2goe30pO1xuXHRcdFx0XHR2YXIgY3R4ID0gLyoqIEB0eXBlIHtDb21wb25lbnRDb250ZXh0fSAqLyAoY29tcG9uZW50X2NvbnRleHQpO1xuXHRcdFx0XHRjdHguYyA9IGNvbnRleHQ7XG5cdFx0XHR9XG5cblx0XHRcdGlmIChldmVudHMpIHtcblx0XHRcdFx0Ly8gV2UgY2FuJ3Qgc3ByZWFkIHRoZSBvYmplY3Qgb3IgZWxzZSB3ZSdkIGxvc2UgdGhlIHN0YXRlIHByb3h5IHN0dWZmLCBpZiBpdCBpcyBvbmVcblx0XHRcdFx0LyoqIEB0eXBlIHthbnl9ICovIChwcm9wcykuJCRldmVudHMgPSBldmVudHM7XG5cdFx0XHR9XG5cblx0XHRcdGlmIChoeWRyYXRpbmcpIHtcblx0XHRcdFx0YXNzaWduX25vZGVzKC8qKiBAdHlwZSB7VGVtcGxhdGVOb2RlfSAqLyAoYW5jaG9yX25vZGUpLCBudWxsKTtcblx0XHRcdH1cblxuXHRcdFx0c2hvdWxkX2ludHJvID0gaW50cm87XG5cdFx0XHQvLyBAdHMtZXhwZWN0LWVycm9yIHRoZSBwdWJsaWMgdHlwaW5ncyBhcmUgbm90IHdoYXQgdGhlIGFjdHVhbCBmdW5jdGlvbiBsb29rcyBsaWtlXG5cdFx0XHRjb21wb25lbnQgPSBDb21wb25lbnQoYW5jaG9yX25vZGUsIHByb3BzKSB8fCB7fTtcblx0XHRcdHNob3VsZF9pbnRybyA9IHRydWU7XG5cblx0XHRcdGlmIChoeWRyYXRpbmcpIHtcblx0XHRcdFx0LyoqIEB0eXBlIHtFZmZlY3R9ICovIChhY3RpdmVfZWZmZWN0KS5ub2Rlc19lbmQgPSBoeWRyYXRlX25vZGU7XG5cdFx0XHR9XG5cblx0XHRcdGlmIChjb250ZXh0KSB7XG5cdFx0XHRcdHBvcCgpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0cmV0dXJuICgpID0+IHtcblx0XHRcdGZvciAodmFyIGV2ZW50X25hbWUgb2YgcmVnaXN0ZXJlZF9ldmVudHMpIHtcblx0XHRcdFx0dGFyZ2V0LnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnRfbmFtZSwgaGFuZGxlX2V2ZW50X3Byb3BhZ2F0aW9uKTtcblxuXHRcdFx0XHR2YXIgbiA9IC8qKiBAdHlwZSB7bnVtYmVyfSAqLyAoZG9jdW1lbnRfbGlzdGVuZXJzLmdldChldmVudF9uYW1lKSk7XG5cblx0XHRcdFx0aWYgKC0tbiA9PT0gMCkge1xuXHRcdFx0XHRcdGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnRfbmFtZSwgaGFuZGxlX2V2ZW50X3Byb3BhZ2F0aW9uKTtcblx0XHRcdFx0XHRkb2N1bWVudF9saXN0ZW5lcnMuZGVsZXRlKGV2ZW50X25hbWUpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGRvY3VtZW50X2xpc3RlbmVycy5zZXQoZXZlbnRfbmFtZSwgbik7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0cm9vdF9ldmVudF9oYW5kbGVzLmRlbGV0ZShldmVudF9oYW5kbGUpO1xuXG5cdFx0XHRpZiAoYW5jaG9yX25vZGUgIT09IGFuY2hvcikge1xuXHRcdFx0XHRhbmNob3Jfbm9kZS5wYXJlbnROb2RlPy5yZW1vdmVDaGlsZChhbmNob3Jfbm9kZSk7XG5cdFx0XHR9XG5cdFx0fTtcblx0fSk7XG5cblx0bW91bnRlZF9jb21wb25lbnRzLnNldChjb21wb25lbnQsIHVubW91bnQpO1xuXHRyZXR1cm4gY29tcG9uZW50O1xufVxuXG4vKipcbiAqIFJlZmVyZW5jZXMgb2YgdGhlIGNvbXBvbmVudHMgdGhhdCB3ZXJlIG1vdW50ZWQgb3IgaHlkcmF0ZWQuXG4gKiBVc2VzIGEgYFdlYWtNYXBgIHRvIGF2b2lkIG1lbW9yeSBsZWFrcy5cbiAqL1xubGV0IG1vdW50ZWRfY29tcG9uZW50cyA9IG5ldyBXZWFrTWFwKCk7XG5cbi8qKlxuICogVW5tb3VudHMgYSBjb21wb25lbnQgdGhhdCB3YXMgcHJldmlvdXNseSBtb3VudGVkIHVzaW5nIGBtb3VudGAgb3IgYGh5ZHJhdGVgLlxuICpcbiAqIFNpbmNlIDUuMTMuMCwgaWYgYG9wdGlvbnMub3V0cm9gIGlzIGB0cnVlYCwgW3RyYW5zaXRpb25zXShodHRwczovL3N2ZWx0ZS5kZXYvZG9jcy9zdmVsdGUvdHJhbnNpdGlvbikgd2lsbCBwbGF5IGJlZm9yZSB0aGUgY29tcG9uZW50IGlzIHJlbW92ZWQgZnJvbSB0aGUgRE9NLlxuICpcbiAqIFJldHVybnMgYSBgUHJvbWlzZWAgdGhhdCByZXNvbHZlcyBhZnRlciB0cmFuc2l0aW9ucyBoYXZlIGNvbXBsZXRlZCBpZiBgb3B0aW9ucy5vdXRyb2AgaXMgdHJ1ZSwgb3IgaW1tZWRpYXRlbHkgb3RoZXJ3aXNlIChwcmlvciB0byA1LjEzLjAsIHJldHVybnMgYHZvaWRgKS5cbiAqXG4gKiBgYGBqc1xuICogaW1wb3J0IHsgbW91bnQsIHVubW91bnQgfSBmcm9tICdzdmVsdGUnO1xuICogaW1wb3J0IEFwcCBmcm9tICcuL0FwcC5zdmVsdGUnO1xuICpcbiAqIGNvbnN0IGFwcCA9IG1vdW50KEFwcCwgeyB0YXJnZXQ6IGRvY3VtZW50LmJvZHkgfSk7XG4gKlxuICogLy8gbGF0ZXIuLi5cbiAqIHVubW91bnQoYXBwLCB7IG91dHJvOiB0cnVlIH0pO1xuICogYGBgXG4gKiBAcGFyYW0ge1JlY29yZDxzdHJpbmcsIGFueT59IGNvbXBvbmVudFxuICogQHBhcmFtIHt7IG91dHJvPzogYm9vbGVhbiB9fSBbb3B0aW9uc11cbiAqIEByZXR1cm5zIHtQcm9taXNlPHZvaWQ+fVxuICovXG5leHBvcnQgZnVuY3Rpb24gdW5tb3VudChjb21wb25lbnQsIG9wdGlvbnMpIHtcblx0Y29uc3QgZm4gPSBtb3VudGVkX2NvbXBvbmVudHMuZ2V0KGNvbXBvbmVudCk7XG5cblx0aWYgKGZuKSB7XG5cdFx0bW91bnRlZF9jb21wb25lbnRzLmRlbGV0ZShjb21wb25lbnQpO1xuXHRcdHJldHVybiBmbihvcHRpb25zKTtcblx0fVxuXG5cdGlmIChERVYpIHtcblx0XHR3LmxpZmVjeWNsZV9kb3VibGVfdW5tb3VudCgpO1xuXHR9XG5cblx0cmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xufVxuIiwiZXhwb3J0IGNsYXNzIEV4YW1wbGVNb2RlbCB7XHJcbiAgICBjb3VudDogbnVtYmVyID0gJHN0YXRlKDApO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMuY291bnQgPSAwO1xyXG4gICAgfVxyXG5cclxuICAgIGluY3JlbWVudCgpIHtcclxuICAgICAgICB0aGlzLmNvdW50Kys7XHJcbiAgICB9XHJcbn0iLCI8c2NyaXB0IGxhbmc9XCJ0c1wiPlxyXG4gICAgaW1wb3J0IHsgRXhhbXBsZU1vZGVsIH0gZnJvbSBcIkBtb2R1bGVzL2V4YW1wbGUvRXhhbXBsZU1vZGVsLnN2ZWx0ZVwiO1xyXG4gICAgbGV0IHsgc29tZVByb3AgfSA9ICRwcm9wcygpO1xyXG5cclxuICAgIGxldCBjb3VudCA9ICRzdGF0ZSgwKTtcclxuICAgIGxldCBtb2RlbCA9IG5ldyBFeGFtcGxlTW9kZWwoKTtcclxuPC9zY3JpcHQ+XHJcblxyXG48ZGl2PlxyXG4gICAgPGgxIGNsYXNzPVwidGV4dC0yeGwgdGV4dC1yZWQtMTAwXCI+SGVsbG8ge3NvbWVQcm9wfSE8L2gxPlxyXG4gICAgPGgyPkxvY2FsIFN0YXRlPC9oMj5cclxuICAgIHtjb3VudH1cclxuICAgIDxidXR0b24gb25jbGljaz17KCkgPT4gY291bnQrK30+KzwvYnV0dG9uPlxyXG4gICAgPGgyPk1vZGVsIFN0YXRlPC9oMj5cclxuICAgIHttb2RlbC5jb3VudH1cclxuICAgIDxidXR0b24gb25jbGljaz17KCkgPT4gbW9kZWwuaW5jcmVtZW50KCl9Pis8L2J1dHRvbj5cclxuPC9kaXY+XHJcbiIsImltcG9ydCB7IEl0ZW1WaWV3LCBXb3Jrc3BhY2VMZWFmIH0gZnJvbSBcIm9ic2lkaWFuXCI7XHJcbmltcG9ydCBFeGFtcGxlQ29tcG9uZW50IGZyb20gXCIuL0V4YW1wbGVDb21wb25lbnQuc3ZlbHRlXCI7XHJcbmltcG9ydCB7IG1vdW50IH0gZnJvbSBcInN2ZWx0ZVwiO1xyXG5cclxuZXhwb3J0IGNsYXNzIEV4YW1wbGVWaWV3IGV4dGVuZHMgSXRlbVZpZXcge1xyXG4gICAgaWRlbnRpZmllcjogc3RyaW5nO1xyXG4gICAgY29tcG9uZW50ITogUmV0dXJuVHlwZTx0eXBlb2YgRXhhbXBsZUNvbXBvbmVudD47XHJcblxyXG4gICAgY29uc3RydWN0b3IobGVhZjogV29ya3NwYWNlTGVhZiwgaWRlbnRpZmllcjogc3RyaW5nKSB7XHJcbiAgICAgICAgc3VwZXIobGVhZik7XHJcbiAgICAgICAgdGhpcy5pZGVudGlmaWVyID0gaWRlbnRpZmllcjtcclxuICAgIH1cclxuXHJcbiAgICBnZXRWaWV3VHlwZSgpOiBzdHJpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmlkZW50aWZpZXI7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0RGlzcGxheVRleHQoKTogc3RyaW5nIHtcclxuICAgICAgICByZXR1cm4gXCJFeGFtcGxlIFZpZXdcIjtcclxuICAgIH1cclxuXHJcbiAgICBhc3luYyBvbk9wZW4oKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICAgICAgdGhpcy5jb21wb25lbnQgPSBtb3VudChFeGFtcGxlQ29tcG9uZW50LCB7XHJcbiAgICAgICAgICAgIHRhcmdldDogdGhpcy5jb250ZW50RWwsXHJcbiAgICAgICAgICAgIHByb3BzOiB7XHJcbiAgICAgICAgICAgICAgICBzb21lUHJvcDogJ3dvcmxkJyxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBhc3luYyBvbkNsb3NlKCk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgfVxyXG59XHJcbiIsImltcG9ydCB7IE5vdGljZSwgUGx1Z2luLCBXb3Jrc3BhY2VMZWFmIH0gZnJvbSBcIm9ic2lkaWFuXCI7XHJcbmltcG9ydCB0eXBlIHsgUGx1Z2luTW9kdWxlIH0gZnJvbSBcIkBtb2R1bGVzL3R5cGVzXCI7XHJcbmltcG9ydCB7IEV4YW1wbGVWaWV3IH0gZnJvbSBcIi4vRXhhbXBsZVZpZXdcIjtcclxuXHJcbmV4cG9ydCBjbGFzcyBFeGFtcGxlTW9kdWxlIGltcGxlbWVudHMgUGx1Z2luTW9kdWxlIHtcclxuICAgIGlkZW50aWZpZXI6IHN0cmluZyA9ICdleGFtcGxlJztcclxuICAgIHBsdWdpbjogUGx1Z2luO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKHBsdWdpbjogUGx1Z2luKSB7XHJcbiAgICAgICAgdGhpcy5wbHVnaW4gPSBwbHVnaW47XHJcbiAgICB9XHJcblxyXG4gICAgb25sb2FkKCk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMucGx1Z2luLmFkZFJpYmJvbkljb24oJ2RpY2UnLCAnU2FtcGxlIFBsdWdpbicsIChldnQ6IE1vdXNlRXZlbnQpID0+IHtcclxuICAgICAgICAgICAgLy8gQ2FsbGVkIHdoZW4gdGhlIHVzZXIgY2xpY2tzIHRoZSBpY29uLlxyXG4gICAgICAgICAgICB0aGlzLmFjdGl2YXRlTGVhZigpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLnBsdWdpbi5yZWdpc3RlclZpZXcoXHJcbiAgICAgICAgICAgIHRoaXMuaWRlbnRpZmllcixcclxuICAgICAgICAgICAgKGxlYWY6IFdvcmtzcGFjZUxlYWYpID0+IG5ldyBFeGFtcGxlVmlldyhsZWFmLCB0aGlzLmlkZW50aWZpZXIpLFxyXG4gICAgICAgICk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGFzeW5jIGFjdGl2YXRlTGVhZigpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgICAgICBjb25zdCB7IHdvcmtzcGFjZSB9ID0gdGhpcy5wbHVnaW4uYXBwO1xyXG4gICAgICAgIGxldCBsZWFmOiBXb3Jrc3BhY2VMZWFmIHwgbnVsbCA9IG51bGw7XHJcblxyXG4gICAgICAgIGNvbnN0IGxlYXZlcyA9IHdvcmtzcGFjZS5nZXRMZWF2ZXNPZlR5cGUodGhpcy5pZGVudGlmaWVyKTtcclxuICAgICAgICBpZiAobGVhdmVzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgbGVhZiA9IGxlYXZlc1swXTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBsZWFmID0gd29ya3NwYWNlLmdldFJpZ2h0TGVhZihmYWxzZSk7XHJcbiAgICAgICAgICAgIGlmIChsZWFmID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIGxlYWYgZm91bmQnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBhd2FpdCBsZWFmLnNldFZpZXdTdGF0ZSh7XHJcbiAgICAgICAgICAgICAgICB0eXBlOiB0aGlzLmlkZW50aWZpZXIsXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICB3b3Jrc3BhY2UucmV2ZWFsTGVhZihsZWFmKTtcclxuICAgIH1cclxuXHJcbiAgICBvbnVubG9hZCgpOiB2b2lkIHtcclxuXHJcbiAgICB9XHJcblxyXG59IiwiaW1wb3J0ICcuL3N0eWxlcy5jc3MnXG5pbXBvcnQgeyBBcHAsIHR5cGUgUGx1Z2luTWFuaWZlc3QsIFBsdWdpbiB9IGZyb20gXCJvYnNpZGlhblwiXG5pbXBvcnQgdHlwZSB7IFBsdWdpbk1vZHVsZSB9IGZyb20gXCJAbW9kdWxlcy90eXBlc1wiO1xuaW1wb3J0IHsgRXhhbXBsZU1vZHVsZSB9IGZyb20gXCIuL21vZHVsZXMvZXhhbXBsZS9FeGFtcGxlTW9kdWxlXCI7XG5cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTXlQbHVnaW4gZXh0ZW5kcyBQbHVnaW4ge1xuICBwcml2YXRlIG1vZHVsZXM6IFBsdWdpbk1vZHVsZVtdO1xuXG4gIGNvbnN0cnVjdG9yKGFwcDogQXBwLCBtYW5pZmVzdDogUGx1Z2luTWFuaWZlc3QpIHtcbiAgICBzdXBlcihhcHAsIG1hbmlmZXN0KTtcbiAgICAvLyBBZGQgbW9kdWxlcyBoZXJlXG4gICAgdGhpcy5tb2R1bGVzID0gW1xuICAgICAgbmV3IEV4YW1wbGVNb2R1bGUodGhpcylcbiAgICBdXG4gIH1cblxuICBhc3luYyBvbmxvYWQoKSB7XG4gICAgdGhpcy5tb2R1bGVzLmZvckVhY2gobW9kdWxlID0+IG1vZHVsZS5vbmxvYWQoKSk7XG4gIH1cblxuICBvbnVubG9hZCgpIHtcbiAgICB0aGlzLm1vZHVsZXMuZm9yRWFjaChtb2R1bGUgPT4gbW9kdWxlLm9udW5sb2FkKCkpO1xuICB9XG5cbn0iXSwibmFtZXMiOlsic291cmNlIiwiZS5zdGF0ZV91bnNhZmVfbXV0YXRpb24iLCJlLnN0YXRlX2Rlc2NyaXB0b3JzX2ZpeGVkIiwidmFsdWUiLCJrZXkiLCJlLnN0YXRlX3Byb3RvdHlwZV9maXhlZCIsImNoaWxkIiwiZWZmZWN0IiwicHVzaCIsInNpYmxpbmciLCJjb21wb25lbnRfY29udGV4dCIsImUuZWZmZWN0X3VwZGF0ZV9kZXB0aF9leGNlZWRlZCIsImUuc3RhdGVfdW5zYWZlX2xvY2FsX3JlYWQiLCJldmVudHMiLCIkLnNldF90ZXh0IiwiSXRlbVZpZXciLCJQbHVnaW4iLCJtb2R1bGUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQVNPLE1BQU0saUJBQWlCO0FDUDlCLElBQUksT0FBTyxXQUFXO0FBRXJCLEdBQUMsT0FBTyxhQUFQLE9BQU8sV0FBYSxFQUFFLEdBQUcsb0JBQUksSUFBRyxNQUFNLEVBQUUsSUFBSSxjQUFjO0FDY3JELE1BQU0sMkJBQTJCLEtBQUs7QUFXdEMsTUFBTSxnQkFBZ0IsT0FBUTtBQzZOckMsTUFBTSxpQkFBaUIsQ0FBQyxjQUFjLFdBQVc7QUFNMUMsU0FBUyxpQkFBaUIsTUFBTTtBQUN0QyxTQUFPLGVBQWUsU0FBUyxJQUFJO0FBQ3BDO0FDbFFBLE1BQUEsTUFBZTtBQ0VSLElBQUksV0FBVyxNQUFNO0FBQ3JCLElBQUksYUFBYSxNQUFNO0FBRXZCLElBQUksa0JBQWtCLE9BQU87QUFDN0IsSUFBSSxp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LFFBQUEsT0FBTyxTQUFTLEdBQUc7QUFDbkIsYUFBTyxPQUFPLENBQUM7QUFBQSxJQUFBLE9BQ1o7QUFDSSxhQUFBLFVBQVUsYUFBYSxLQUFLO0FBQ25DLFVBQUksU0FBUyxNQUFNO0FBQ1QsY0FBQSxJQUFJLE1BQU0sZUFBZTtBQUFBLE1BQUE7QUFFbkMsWUFBTSxLQUFLLGFBQWE7QUFBQSxRQUNwQixNQUFNLEtBQUs7QUFBQSxNQUFBLENBQ2Q7QUFBQSxJQUFBO0FBRUwsY0FBVSxXQUFXLElBQUk7QUFBQSxFQUFBO0FBQUEsRUFHN0IsV0FBaUI7QUFBQSxFQUFBO0FBSXJCO0FDMUNBLE1BQXFCLGlCQUFpQkMsU0FBQUEsT0FBTztBQUFBLEVBRzNDLFlBQVksS0FBVSxVQUEwQjtBQUM5QyxVQUFNLEtBQUssUUFBUTtBQUhiO0FBS04sU0FBSyxVQUFVO0FBQUEsTUFDYixJQUFJLGNBQWMsSUFBSTtBQUFBLElBQ3hCO0FBQUEsRUFBQTtBQUFBLEVBR0YsTUFBTSxTQUFTO0FBQ2IsU0FBSyxRQUFRLFFBQVEsQ0FBVUMsWUFBQUEsUUFBTyxRQUFRO0FBQUEsRUFBQTtBQUFBLEVBR2hELFdBQVc7QUFDVCxTQUFLLFFBQVEsUUFBUSxDQUFVQSxZQUFBQSxRQUFPLFVBQVU7QUFBQSxFQUFBO0FBR3BEOzsiLCJ4X2dvb2dsZV9pZ25vcmVMaXN0IjpbMCwxLDIsMyw0LDUsNiw3LDgsOSwxMCwxMSwxMiwxMywxNCwxNSwxNiwxNywxOCwxOV19
