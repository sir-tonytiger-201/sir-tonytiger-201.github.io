(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function action_destroyer(action_result) {
        return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function get_root_for_style(node) {
        if (!node)
            return document;
        const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
        if (root && root.host) {
            return root;
        }
        return node.ownerDocument;
    }
    function append_empty_stylesheet(node) {
        const style_element = element('style');
        append_stylesheet(get_root_for_style(node), style_element);
        return style_element.sheet;
    }
    function append_stylesheet(node, style) {
        append(node.head || node, style);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        if (value === null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
    }
    function select_option(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
        select.selectedIndex = -1; // no option should be selected
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked') || select.options[0];
        return selected_option && selected_option.__value;
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }
    class HtmlTag {
        constructor() {
            this.e = this.n = null;
        }
        c(html) {
            this.h(html);
        }
        m(html, target, anchor = null) {
            if (!this.e) {
                this.e = element(target.nodeName);
                this.t = target;
                this.c(html);
            }
            this.i(anchor);
        }
        h(html) {
            this.e.innerHTML = html;
            this.n = Array.from(this.e.childNodes);
        }
        i(anchor) {
            for (let i = 0; i < this.n.length; i += 1) {
                insert(this.t, this.n[i], anchor);
            }
        }
        p(html) {
            this.d();
            this.h(html);
            this.i(this.a);
        }
        d() {
            this.n.forEach(detach);
        }
    }

    // we need to store the information for multiple documents because a Svelte application could also contain iframes
    // https://github.com/sveltejs/svelte/issues/3624
    const managed_styles = new Map();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_style_information(doc, node) {
        const info = { stylesheet: append_empty_stylesheet(node), rules: {} };
        managed_styles.set(doc, info);
        return info;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = get_root_for_style(node);
        const { stylesheet, rules } = managed_styles.get(doc) || create_style_information(doc, node);
        if (!rules[name]) {
            rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            managed_styles.forEach(info => {
                const { stylesheet } = info;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                info.rules = {};
            });
            managed_styles.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function tick() {
        schedule_update();
        return resolved_promise;
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_bidirectional_transition(node, fn, params, intro) {
        let config = fn(node, params);
        let t = intro ? 0 : 1;
        let running_program = null;
        let pending_program = null;
        let animation_name = null;
        function clear_animation() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function init(program, duration) {
            const d = (program.b - t);
            duration *= Math.abs(d);
            return {
                a: t,
                b: program.b,
                d,
                duration,
                start: program.start,
                end: program.start + duration,
                group: program.group
            };
        }
        function go(b) {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            const program = {
                start: now() + delay,
                b
            };
            if (!b) {
                // @ts-ignore todo: improve typings
                program.group = outros;
                outros.r += 1;
            }
            if (running_program || pending_program) {
                pending_program = program;
            }
            else {
                // if this is an intro, and there's a delay, we need to do
                // an initial tick and/or apply CSS animation immediately
                if (css) {
                    clear_animation();
                    animation_name = create_rule(node, t, b, duration, delay, easing, css);
                }
                if (b)
                    tick(0, 1);
                running_program = init(program, duration);
                add_render_callback(() => dispatch(node, b, 'start'));
                loop(now => {
                    if (pending_program && now > pending_program.start) {
                        running_program = init(pending_program, duration);
                        pending_program = null;
                        dispatch(node, running_program.b, 'start');
                        if (css) {
                            clear_animation();
                            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                        }
                    }
                    if (running_program) {
                        if (now >= running_program.end) {
                            tick(t = running_program.b, 1 - t);
                            dispatch(node, running_program.b, 'end');
                            if (!pending_program) {
                                // we're done
                                if (running_program.b) {
                                    // intro — we can tidy up immediately
                                    clear_animation();
                                }
                                else {
                                    // outro — needs to be coordinated
                                    if (!--running_program.group.r)
                                        run_all(running_program.group.c);
                                }
                            }
                            running_program = null;
                        }
                        else if (now >= running_program.start) {
                            const p = now - running_program.start;
                            t = running_program.a + running_program.d * easing(p / running_program.duration);
                            tick(t, 1 - t);
                        }
                    }
                    return !!(running_program || pending_program);
                });
            }
        }
        return {
            run(b) {
                if (is_function(config)) {
                    wait().then(() => {
                        // @ts-ignore
                        config = config();
                        go(b);
                    });
                }
                else {
                    go(b);
                }
            },
            end() {
                clear_animation();
                running_program = pending_program = null;
            }
        };
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.46.4' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }

    function scale(node, { delay = 0, duration = 400, easing = cubicOut, start = 0, opacity = 0 } = {}) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const sd = 1 - start;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (_t, u) => `
			transform: ${transform} scale(${1 - (sd * u)});
			opacity: ${target_opacity - (od * u)}
		`
        };
    }

    function flip(node, { from, to }, params = {}) {
        const style = getComputedStyle(node);
        const transform = style.transform === 'none' ? '' : style.transform;
        const [ox, oy] = style.transformOrigin.split(' ').map(parseFloat);
        const dx = (from.left + from.width * ox / to.width) - (to.left + ox);
        const dy = (from.top + from.height * oy / to.height) - (to.top + oy);
        const { delay = 0, duration = (d) => Math.sqrt(d) * 120, easing = cubicOut } = params;
        return {
            delay,
            duration: is_function(duration) ? duration(Math.sqrt(dx * dx + dy * dy)) : duration,
            easing,
            css: (t, u) => {
                const x = u * dx;
                const y = u * dy;
                const sx = t + u * from.width / to.width;
                const sy = t + u * from.height / to.height;
                return `transform: ${transform} translate(${x}px, ${y}px) scale(${sx}, ${sy});`;
            }
        };
    }

    /* src/components/TextInput.svelte generated by Svelte v3.46.4 */
    const file$5 = "src/components/TextInput.svelte";

    // (33:2) {:else}
    function create_else_block$1(ctx) {
    	let input;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			input = element("input");
    			attr_dev(input, "type", "text");
    			attr_dev(input, "class", "svelte-dmg1ed");
    			add_location(input, file$5, 33, 4, 869);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*value*/ ctx[0]);

    			if (!mounted) {
    				dispose = listen_dev(input, "input", /*input_input_handler*/ ctx[8]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*value*/ 1 && input.value !== /*value*/ ctx[0]) {
    				set_input_value(input, /*value*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(33:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (15:2) {#if multiline}
    function create_if_block$2(ctx) {
    	let textarea;
    	let textarea_transition;
    	let current;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			textarea = element("textarea");
    			textarea.autofocus = true;
    			attr_dev(textarea, "placeholder", "Type or paste text here.\n\nLeft-click to expand/contract. Window will automatically contract when mouse moves outside.\n\nThe Tab key will cycle through ciphers, or use arrow buttons.");
    			attr_dev(textarea, "spellcheck", false);
    			set_style(textarea, "padding", "1em");
    			attr_dev(textarea, "class", "svelte-dmg1ed");
    			toggle_class(textarea, "focused", /*focused*/ ctx[3]);
    			add_location(textarea, file$5, 16, 4, 377);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, textarea, anchor);
    			set_input_value(textarea, /*value*/ ctx[0]);
    			current = true;
    			textarea.focus();

    			if (!mounted) {
    				dispose = [
    					listen_dev(textarea, "input", /*textarea_input_handler*/ ctx[5]),
    					listen_dev(textarea, "click", /*click_handler*/ ctx[6], false, false, false),
    					listen_dev(textarea, "mouseleave", /*mouseleave_handler*/ ctx[7], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*value*/ 1) {
    				set_input_value(textarea, /*value*/ ctx[0]);
    			}

    			if (dirty & /*focused*/ 8) {
    				toggle_class(textarea, "focused", /*focused*/ ctx[3]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!textarea_transition) textarea_transition = create_bidirectional_transition(textarea, scale, { duration: 1000, easing: cubicOut }, true);
    				textarea_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!textarea_transition) textarea_transition = create_bidirectional_transition(textarea, scale, { duration: 1000, easing: cubicOut }, false);
    			textarea_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(textarea);
    			if (detaching && textarea_transition) textarea_transition.end();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(15:2) {#if multiline}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let label_1;
    	let span;
    	let t0;
    	let t1;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	const if_block_creators = [create_if_block$2, create_else_block$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*multiline*/ ctx[2]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			label_1 = element("label");
    			span = element("span");
    			t0 = text(/*label*/ ctx[1]);
    			t1 = space();
    			if_block.c();
    			attr_dev(span, "class", "svelte-dmg1ed");
    			add_location(span, file$5, 13, 2, 331);
    			attr_dev(label_1, "for", "");
    			attr_dev(label_1, "class", "svelte-dmg1ed");
    			add_location(label_1, file$5, 12, 0, 314);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label_1, anchor);
    			append_dev(label_1, span);
    			append_dev(span, t0);
    			append_dev(label_1, t1);
    			if_blocks[current_block_type_index].m(label_1, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*label*/ 2) set_data_dev(t0, /*label*/ ctx[1]);
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(label_1, null);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label_1);
    			if_blocks[current_block_type_index].d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('TextInput', slots, []);
    	let { label } = $$props;
    	let { value } = $$props;
    	let { multiline = false } = $$props;
    	let { shortcut } = $$props;
    	let focused = false;
    	const writable_props = ['label', 'value', 'multiline', 'shortcut'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<TextInput> was created with unknown prop '${key}'`);
    	});

    	function textarea_input_handler() {
    		value = this.value;
    		$$invalidate(0, value);
    	}

    	const click_handler = () => $$invalidate(3, focused = !focused);
    	const mouseleave_handler = () => $$invalidate(3, focused = false);

    	function input_input_handler() {
    		value = this.value;
    		$$invalidate(0, value);
    	}

    	$$self.$$set = $$props => {
    		if ('label' in $$props) $$invalidate(1, label = $$props.label);
    		if ('value' in $$props) $$invalidate(0, value = $$props.value);
    		if ('multiline' in $$props) $$invalidate(2, multiline = $$props.multiline);
    		if ('shortcut' in $$props) $$invalidate(4, shortcut = $$props.shortcut);
    	};

    	$$self.$capture_state = () => ({
    		scale,
    		cubicOut,
    		flip,
    		label,
    		value,
    		multiline,
    		shortcut,
    		focused
    	});

    	$$self.$inject_state = $$props => {
    		if ('label' in $$props) $$invalidate(1, label = $$props.label);
    		if ('value' in $$props) $$invalidate(0, value = $$props.value);
    		if ('multiline' in $$props) $$invalidate(2, multiline = $$props.multiline);
    		if ('shortcut' in $$props) $$invalidate(4, shortcut = $$props.shortcut);
    		if ('focused' in $$props) $$invalidate(3, focused = $$props.focused);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		value,
    		label,
    		multiline,
    		focused,
    		shortcut,
    		textarea_input_handler,
    		click_handler,
    		mouseleave_handler,
    		input_input_handler
    	];
    }

    class TextInput extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {
    			label: 1,
    			value: 0,
    			multiline: 2,
    			shortcut: 4
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TextInput",
    			options,
    			id: create_fragment$5.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*label*/ ctx[1] === undefined && !('label' in props)) {
    			console.warn("<TextInput> was created without expected prop 'label'");
    		}

    		if (/*value*/ ctx[0] === undefined && !('value' in props)) {
    			console.warn("<TextInput> was created without expected prop 'value'");
    		}

    		if (/*shortcut*/ ctx[4] === undefined && !('shortcut' in props)) {
    			console.warn("<TextInput> was created without expected prop 'shortcut'");
    		}
    	}

    	get label() {
    		throw new Error("<TextInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set label(value) {
    		throw new Error("<TextInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<TextInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<TextInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get multiline() {
    		throw new Error("<TextInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set multiline(value) {
    		throw new Error("<TextInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get shortcut() {
    		throw new Error("<TextInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set shortcut(value) {
    		throw new Error("<TextInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    // ============================= Logic ==============================

    class cipher { // cipher constructor class
    	constructor(ciphName, ciphCategory, col_H, col_S, col_L, ciphCharacterSet, ciphValues, diacriticsAsRegular = true, ciphEnabled = false, caseSensitive = false) {
    		this.cipherName = ciphName; // cipher name
    		this.cipherCategory = ciphCategory; // cipher category
    		this.H = col_H; // hue
    		this.S = col_S; // saturation
    		this.L = col_L; // lightness
    		this.cArr = ciphCharacterSet; // character array
    		this.vArr = ciphValues; // value array
    		this.diacriticsAsRegular = diacriticsAsRegular; // if true, characters with diactritic marks have the same value as regular ones
    		this.caseSensitive = caseSensitive; // capital letters have different values
    		this.enabled = ciphEnabled; // cipher state on/off
    		this.cp = []; this.cv = []; this.sumArr = []; // cp - character position, cv - character value, sumArr - phrase gematria value
    	}

    	calcGematria(gemPhrase) { // calculate gematria of a phrase
    		var i, ch_pos, cur_char;
    		var gemValue = 0;
    		var n = 0;
    		
    		if (optAllowPhraseComments == true) { gemPhrase = gemPhrase.replace(/\[.+\]/g, '').trim(); } // remove [...], leading/trailing spaces
    		/*if (this.diacriticsAsRegular) {
    			gemPhrase = gemPhrase.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase()
    		} else {
    			gemPhrase = gemPhrase.toLowerCase()
    		}*/
    		if (this.diacriticsAsRegular) gemPhrase = gemPhrase.normalize('NFD').replace(/[\u0300-\u036f]/g, "");
    		if (this.caseSensitive == false) gemPhrase = gemPhrase.toLowerCase();

    		if (optGemSubstitutionMode) { // each character is substituted with a correspondent value
    			for (i = 0; i < gemPhrase.length; i++) {
    				cur_char = gemPhrase.charCodeAt(i);
    				ch_pos = this.cArr.indexOf(cur_char);
    				if (ch_pos > -1) { // append value for each found character
    					gemValue += this.vArr[ch_pos];
    				}
    			}
    		} else if (optGemMultCharPos) { // multiply each charater value based on character index
    			for (i = 0; i < gemPhrase.length; i++) {
    				cur_char = gemPhrase.charCodeAt(i);
    				ch_pos = this.cArr.indexOf(cur_char);
    				if (ch_pos > -1) { // append value for each found character
    					n++;
    					gemValue += this.vArr[ch_pos] * n;
    				}
    			}
    		} else if (optGemMultCharPosReverse) { // multiply each charater value (reverse index)
    			for (i = gemPhrase.length; i >= 0; i--) {
    				cur_char = gemPhrase.charCodeAt(i);
    				ch_pos = this.cArr.indexOf(cur_char);
    				if (ch_pos > -1) { // append value for each found character
    					n++;
    					gemValue += this.vArr[ch_pos] * n;
    				}
    			}
    		}

    		if (optNumCalcMethod == 1) { // treat consecutive digits as one number
    			var cur_num = "";
    			var digitArr = [48,49,50,51,52,53,54,55,56,57]; // 0-9
    			var nArr = [0,1,2,3,4,5,6,7,8,9];
    			for (i = 0; i < gemPhrase.length; i++) {
    				cur_char = gemPhrase.charCodeAt(i);
    				if (digitArr.indexOf(cur_char) > -1) {
    					cur_num += String(nArr[digitArr.indexOf(cur_char)]); // append consecutive digits
    				} else if (cur_num.length > 0 && cur_char !== 44) { // exclude comma as number separator
    					gemValue += Number(cur_num); // add value of the number
    					cur_num = ""; // reset
    				}
    			}
    			if (cur_num.length > 0) {
    				gemValue += Number(cur_num); // add last number if present
    			}
    		} else if (optNumCalcMethod == 2) { // add each digit separately
    			for (i = 0; i < gemPhrase.length; i++) {
    				cur_char = gemPhrase.charCodeAt(i);
    				if (cur_char > 47 && cur_char < 58) { // 48 to 57, 0-9
    					gemValue += cur_char - 48;
    				}
    			}
    		}

    		return gemValue
    	}
    	
    	calcGematriaFast(gemPhrase) { // calculate gematria (no numbers, lowercase only)
    		var i, ch_pos, cur_char;
    		var gemValue = 0;
    		for (i = 0; i < gemPhrase.length; i++) {
    			cur_char = gemPhrase.charCodeAt(i);
    			ch_pos = this.cArr.indexOf(cur_char);
    			if (ch_pos > -1) gemValue += this.vArr[ch_pos];
    		}
    		return gemValue
    	}

    	calcBreakdown(gemPhrase) { // character breakdown table
    		var i, cIndex, wordSum; //
    		var lastSpace = true;
    		var n, nv; // n - character for display, nv - charcode for calculation

    		 // remove [...], separate brackets, leading/trailing spaces
    		if (optAllowPhraseComments == true) { gemPhrase = gemPhrase.replace(/\[.+\]/g, '').replace(/\[/g, '').replace(/\]/g, '').trim(); }

    		// character positions, character values, current number (if char is a digit)
    		this.cp = []; this.cv = []; this.curNum = ""; this.LetterCount = 0;

    		this.sumArr = []; wordSum = 0;
    		for (i = 0; i < gemPhrase.length; i++) {

    			n = gemPhrase.charCodeAt(i); // get charcode for each character in phrase

    			if (this.diacriticsAsRegular) { // if characters with diacritic marks are treated as regular characters
    				nv = gemPhrase.substring(i,i+1).normalize('NFD').replace(/[\u0300-\u036f]/g, "");
    				// console.log(gemPhrase.substring(i,i+1)+" ("+gemPhrase.substring(i,i+1).charCodeAt(0)+
    				// 	") -> "+String.fromCharCode(n).normalize('NFD').replace(/[\u0300-\u036f]/g, "")+" ("+String.fromCharCode(n).normalize('NFD').replace(/[\u0300-\u036f]/g, "").charCodeAt(0)+
    				// 	") -> "+String.fromCharCode(n).normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase()+" -> "+String.fromCharCode(n).normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase().charCodeAt(0) )
    			} else {
    				nv = gemPhrase.substring(i,i+1); // formatted charcode (lowercase) - for calculation
    				// console.log(gemPhrase.substring(i,i+1)+" ("+gemPhrase.substring(i,i+1).charCodeAt(0)+
    				// 	") -> "+String.fromCharCode(n).toLowerCase()+" -> "+String.fromCharCode(n).toLowerCase().charCodeAt(0) )
    			}
    			if (this.caseSensitive == false) nv = nv.toLowerCase();
    			nv = nv.charCodeAt(0);

    			if (n > 47 && n < 58) { // 0-9 digits
    				if (optNumCalcMethod == 1) {
    					this.curNum = String(this.curNum) + String(n - 48); // append digits
    					if (lastSpace == false) {
    						this.cp.push(" ");
    						this.cv.push(" ");
    						this.sumArr.push(wordSum);
    						wordSum = 0;
    						lastSpace = true;
    					}
    				} else if (optNumCalcMethod == 2) {
    					this.cp.push("num" + String(n - 48));
    					this.cv.push(n - 48);
    					this.curNum = String(n - 48);
    					wordSum += n - 48;
    					lastSpace = false;
    				}
    				
    			} else {
    				if (optNumCalcMethod == 1) {
    					if (this.curNum.length > 0 & n !== 44) { // character is not "44" comma (digit separator)
    						this.cp.push("num" + String(this.curNum), " ");
    						this.cv.push(Number(this.curNum), " ");
    						this.sumArr.push(Number(this.curNum));
    						this.curNum = "";
    					}
    				}
    				
    				cIndex = this.cArr.indexOf(nv); // index of current character in phrase inside all character arrays available for current cipher
    				if (cIndex > -1) {
    					lastSpace = false;
    					wordSum += this.vArr[cIndex];
    					this.cp.push(n);
    					this.LetterCount++;
    					this.cv.push(this.vArr[cIndex]);
    				} else if (n !== 39 && lastSpace == false) {
    					this.sumArr.push(wordSum);
    					wordSum = 0;
    					this.cp.push(" ");
    					this.cv.push(" ");
    					lastSpace = true;
    				}
    			}
    		}
    		if (lastSpace == false) {this.sumArr.push(wordSum);} // add number value to phrase gematria
    		if (this.curNum !== "") {
    			if (optNumCalcMethod == 1) {
    				this.cp.push("num" + String(this.curNum));
    				this.cv.push(Number(this.curNum));
    				this.sumArr.push(Number(this.curNum)); // value of full number
    				if (this.sumArr.length > 1) {
    					this.cp.push(" ");
    					this.cv.push(" ");
    				}
    			}
    		}
    		if (this.sumArr.length > 1 && lastSpace == false) {
    			this.cp.push(" ");
    			this.cv.push(" ");
    		}

    		this.WordCount = this.sumArr.length; // word count

    		if (optGemMultCharPos) { // multiply each charater value based on character index
    			this.sumArr = []; // clear word sums
    			wordSum = 0;
    			n = 0; // vaild character index (defined in cipher)
    			for (i = 0; i < this.cp.length; i++) {
    				if (typeof(this.cp[i]) == "number") { // character value, not "numXX"
    					n++;
    					this.cv[i] *= n; // multiply character value by position
    					wordSum += this.cv[i];
    				} else if (this.cp[i] == " ") { // space
    					this.sumArr.push(wordSum);
    					wordSum = 0; // reset
    				} else if (typeof(this.cp[i]) == "string") { // numerical value "numXX"
    					this.sumArr.push(this.cv[i]); // push number itself
    					wordSum = 0; // reset
    				}
    			}
    			if (wordSum !== 0) this.sumArr.push(wordSum); // last word value
    		} else if (optGemMultCharPosReverse) { // multiply each charater value (reverse index)
    			this.sumArr = []; // clear word sums
    			wordSum = 0;
    			n = 0; // vaild character index (defined in cipher)
    			var count = this.cp.length-1; // array index is one less
    			if (this.cp[this.cp.length - 1] == " ") count = this.cp.length-2; // exclude last character if a space

    			for (i = count; i >= 0; i--) {
    				if (typeof(this.cp[i]) == "number") { // character value, not "numXX"
    					n++;
    					this.cv[i] *= n; // multiply character value by position
    					wordSum += this.cv[i];
    				} else if (this.cp[i] == " ") { // space
    					this.sumArr.unshift(wordSum); // insert in the beginning of array
    					wordSum = 0; // reset
    				} else if (typeof(this.cp[i]) == "string") { // numerical value "numXX"
    					this.sumArr.unshift(this.cv[i]); // number itself
    					wordSum = 0; // reset
    				}
    			}
    			if (wordSum !== 0) this.sumArr.unshift(wordSum); // last word value
    		}
    	}

    }

    // ciphers.js

    /*
    new cipher(
    	"English Ordinal", // cipher name
    	"English", // category
    	120, 57, 36, // hue, saturation, lightness
    	[97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122], // lowercase characters
    	[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26], // values
    	true, // characters with diacritic marks have the same value as regular ones, default is "true"
    	true // enabled state, default is "false"
    	false // case sensitive cipher, default is "false"
    )
    */

    const maxCiphers = 9;

    const cipherList = [
    	new cipher(
    		"English Ordinal",
    		"English",
    		120, 65, 62,
    		[97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122],
    		[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26],
    		true,
    		true,
    		false
    	),
    	new cipher(
    		"Pythagorean Reduction",
    		"English",
    		216, 95, 73,
    		[97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122],
    		[1,2,3,4,5,6,7,8,9,1,2,3,4,5,6,7,8,9,1,2,3,4,5,6,7,8],
    		true,
    		true,
    		false
    	),
    	new cipher(
    		"Reverse Ordinal",
    		"English",
    		146, 74, 50,
    		[97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122],
    		[26,25,24,23,22,21,20,19,18,17,16,15,14,13,12,11,10,9,8,7,6,5,4,3,2,1],
    		true,
    		true,
    		false
    	),
    	new cipher(
    		"Reverse Pythagorean",
    		"English",
    		180, 60, 69,
    		[97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122],
    		[8,7,6,5,4,3,2,1,9,8,7,6,5,4,3,2,1,9,8,7,6,5,4,3,2,1],
    		true,
    		true,
    		false
    	),
    	new cipher(
    		"English Sumerian",
    		"English",
    		95, 41, 69,
    		[97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122],
    		[6,12,18,24,30,36,42,48,54,60,66,72,78,84,90,96,102,108,114,120,126,132,138,144,150,156],
    		true,
    		false,
    		false
    	),
    	new cipher(
    		"Reverse Sumerian",
    		"English",
    		50, 51, 72,
    		[97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122],
    		[156,150,144,138,132,126,120,114,108,102,96,90,84,78,72,66,60,54,48,42,36,30,24,18,12,6],
    		true,
    		false,
    		false
    	),
    	new cipher(
    		"English Extended",
    		"English",
    		50, 78, 63,
    		[97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122],
    		[1,2,3,4,5,6,7,8,9,10,20,30,40,50,60,70,80,90,100,200,300,400,500,600,700,800],
    		true,
    		false,
    		false
    	),
    	new cipher(
    		"Reverse Extended",
    		"English",
    		48, 49, 72,
    		[97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122],
    		[800,700,600,500,400,300,200,100,90,80,70,60,50,40,30,20,10,9,8,7,6,5,4,3,2,1],
    		true,
    		false,
    		false
    	),
    	new cipher(
    		"Bacon Simple",
    		"Baconian",
    		120, 65, 62,
    		[97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122],
    		[1,2,3,4,5,6,7,8,9,9,10,11,12,13,14,15,16,17,18,19,20,20,21,22,23,24],
    		true,
    		false,
    		false
    	),
    	new cipher(
    		"Bacon Reverse",
    		"Baconian",
    		146, 74, 50,
    		[97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122],
    		[24,23,22,21,20,19,18,17,16,16,15,14,13,12,11,10,9,8,7,6,5,5,4,3,2,1],
    		true,
    		false,
    		false
    	),
    	new cipher(
    		"Bacon Short",
    		"Baconian",
    		180, 60, 69,
    		[97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122],
    		[1,2,3,4,5,6,7,8,9,9,1,2,3,4,5,6,7,8,9,1,2,2,3,4,5,6],
    		true,
    		false,
    		false
    	),
    	new cipher(
    		"Bacon Short Reverse",
    		"Baconian",
    		207, 77, 64,
    		[97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122],
    		[6,5,4,3,2,1,9,8,7,7,6,5,4,3,2,1,9,8,7,6,5,5,4,3,2,1],
    		true,
    		false,
    		false
    	),
    	new cipher(
    		"Bacon Kaye",
    		"Baconian",
    		0, 65, 66,
    		[97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122],
    		[27,28,29,30,31,32,33,34,35,35,10,11,12,13,14,15,16,17,18,19,20,20,21,22,23,24],
    		true,
    		false,
    		false
    	),
    	new cipher(
    		"Modern Kaye",
    		"Baconian",
    		352, 61, 78,
    		[97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122],
    		[27,28,29,30,31,32,33,34,35,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26],
    		true,
    		false,
    		false
    	),
    	new cipher(
    		"Illuminati Novice",
    		"Illuminati",
    		33, 91, 58,
    		[97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122],
    		[12,11,10,9,8,7,6,5,4,4,3,2,1,13,14,15,16,17,18,19,20,20,21,22,23,24],
    		true,
    		false,
    		false
    	),
    	new cipher(
    		"Illuminati Reverse",
    		"Illuminati",
    		60, 68, 68,
    		[97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122],
    		[24,23,22,21,20,19,18,17,16,16,15,14,13,1,2,3,4,5,6,7,8,8,9,10,11,12],
    		true,
    		false,
    		false
    	),
    	new cipher(
    		"Agrippa Key",
    		"Latin",
    		256, 95, 76,
    		[97,98,99,100,101,102,103,104,105,107,108,109,110,111,112,113,114,115,116,117,120,121,122,106,118,10680,119],
    		[1,2,3,4,5,6,7,8,9,10,20,30,40,50,60,70,80,90,100,200,300,400,500,600,700,800,900],
    		true,
    		false,
    		false
    	),
    	new cipher(
    		"Agrippa Ordinal",
    		"Latin",
    		264, 90, 82,
    		[97,98,99,100,101,102,103,104,105,107,108,109,110,111,112,113,114,115,116,117,120,121,122,106,118,10680,119],
    		[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27],
    		true,
    		false,
    		false
    	),
    	new cipher(
    		"Agrippa Reduction",
    		"Latin",
    		236, 95, 86,
    		[97,98,99,100,101,102,103,104,105,107,108,109,110,111,112,113,114,115,116,117,120,121,122,106,118,10680,119],
    		[1,2,3,4,5,6,7,8,9,1,2,3,4,5,6,7,8,9,1,2,3,4,5,6,7,8,9],
    		true,
    		false,
    		false
    	),
    	new cipher(
    		"Beatus of Liebana",
    		"Latin",
    		216, 95, 73,
    		[97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122],
    		[1,2,3,4,5,6,7,8,9,9,10,20,30,40,50,60,70,80,90,100,200,200,200,300,400,500],
    		true,
    		false,
    		false
    	),
    	new cipher(
    		"Beatus Ordinal",
    		"Latin",
    		216, 87, 80,
    		[97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122],
    		[1,2,3,4,5,6,7,8,9,9,10,11,12,13,14,15,16,17,18,19,20,20,20,21,22,23],
    		true,
    		false,
    		false
    	),
    	new cipher(
    		"Beatus Reduction",
    		"Latin",
    		216, 53, 68,
    		[97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122],
    		[1,2,3,4,5,6,7,8,9,9,1,2,3,4,5,6,7,8,9,1,2,2,2,3,4,5],
    		true,
    		false,
    		false
    	),
    	new cipher(
    		"English Qaballa",
    		"Thelemic",
    		13, 68, 64,
    		[97,108,119,104,115,100,111,122,107,118,103,114,99,110,121,106,117,102,113,98,109,120,105,116,101,112],
    		[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26],
    		true,
    		false,
    		false
    	),
    	new cipher(
    		"Cipher X",
    		"Thelemic",
    		36, 94, 64,
    		[107,102,119,114,109,100,121,116,97,118,113,104,99,120,111,106,101,108,103,98,115,110,105,122,117,112],
    		[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26],
    		true,
    		false,
    		false
    	),
    	new cipher(
    		"Trigrammaton Qabalah",
    		"Thelemic",
    		195, 68, 69,
    		[105,108,99,104,112,97,120,106,119,116,111,103,102,101,114,115,113,107,121,122,98,109,118,100,110,117],
    		[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25],
    		true,
    		false,
    		false
    	),
    	new cipher(
    		"Alphanumeric Qabbala",
    		"Thelemic",
    		60, 33, 62,
    		[97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122],
    		[10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35],
    		true,
    		false,
    		false
    	),
    	new cipher(
    		"Cheiro Numerology",
    		"Other",
    		79, 36, 61,
    		[97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122],
    		[1,2,3,4,5,8,3,5,1,1,2,3,4,5,7,8,1,2,3,4,6,6,6,5,1,7],
    		true,
    		false,
    		false
    	),
    	new cipher(
    		"Case Sensitive",
    		"Other",
    		190, 50, 60,
    		[97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90],
    		[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52],
    		true,
    		false,
    		true
    	),
    	new cipher(
    		"Alt Case Sensitive",
    		"Other",
    		127, 36, 62,
    		[65,97,66,98,67,99,68,100,69,101,70,102,71,103,72,104,73,105,74,106,75,107,76,108,77,109,78,110,79,111,80,112,81,113,82,114,83,115,84,116,85,117,86,118,87,119,88,120,89,121,90,122],
    		[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52],
    		true,
    		false,
    		true
    	),
    	new cipher(
    		"Hebrew Ordinal",
    		"Hebrew",
    		33, 91, 58,
    		[1488,1489,1490,1491,1492,1493,1494,1495,1496,1497,1499,1500,1502,1504,1505,1506,1508,1510,1511,1512,1513,1514,1498,1501,1503,1507,1509],
    		[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,11,13,14,17,18],
    		true,
    		false,
    		false
    	),
    	new cipher(
    		"Hebrew Reduction",
    		"Hebrew",
    		45, 95, 53,
    		[1488,1489,1490,1491,1492,1493,1494,1495,1496,1497,1499,1500,1502,1504,1505,1506,1508,1510,1511,1512,1513,1514,1498,1501,1503,1507,1509],
    		[1,2,3,4,5,6,7,8,9,1,2,3,4,5,6,7,8,9,1,2,3,4,2,4,5,8,9],
    		true,
    		false,
    		false
    	),
    	new cipher(
    		"Hebrew Gematria",
    		"Hebrew",
    		50, 78, 63,
    		[1488,1489,1490,1491,1492,1493,1494,1495,1496,1497,1499,1500,1502,1504,1505,1506,1508,1510,1511,1512,1513,1514,1498,1501,1503,1507,1509],
    		[1,2,3,4,5,6,7,8,9,10,20,30,40,50,60,70,80,90,100,200,300,400,20,40,50,80,90],
    		true,
    		false,
    		false
    	),
    	new cipher(
    		"Hebrew Soffits",
    		"Hebrew",
    		44, 62, 73,
    		[1488,1489,1490,1491,1492,1493,1494,1495,1496,1497,1499,1500,1502,1504,1505,1506,1508,1510,1511,1512,1513,1514,1498,1501,1503,1507,1509],
    		[1,2,3,4,5,6,7,8,9,10,20,30,40,50,60,70,80,90,100,200,300,400,500,600,700,800,900],
    		true,
    		false,
    		false
    	),
    	new cipher(
    		"Greek Ordinal",
    		"Greek",
    		154, 70, 67,
    		[945,946,947,948,949,989,987,950,951,952,953,954,955,956,957,958,959,960,985,961,963,962,964,965,966,967,968,969,993],
    		[1,2,3,4,5,6,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,20,21,22,23,24,25,26,27],
    		true,
    		false,
    		false
    	),
    	new cipher(
    		"Greek Reduction",
    		"Greek",
    		141, 53, 80,
    		[945,946,947,948,949,989,987,950,951,952,953,954,955,956,957,958,959,960,985,961,963,962,964,965,966,967,968,969,993],
    		[1,2,3,4,5,6,6,7,8,9,1,2,3,4,5,6,7,8,9,1,2,2,3,4,5,6,7,8,9],
    		true,
    		false,
    		false
    	),
    	new cipher(
    		"Greek Isopsephy",
    		"Greek",
    		191, 71, 71,
    		[945,946,947,948,949,989,987,950,951,952,953,954,955,956,957,958,959,960,985,961,963,962,964,965,966,967,968,969,993],
    		[1,2,3,4,5,6,6,7,8,9,10,20,30,40,50,60,70,80,90,100,200,200,300,400,500,600,700,800,900],
    		true,
    		false,
    		false
    	),
    	new cipher(
    		"Greek Ordinal 24",
    		"Greek",
    		218, 75, 81,
    		[945,946,947,948,949,950,951,952,953,954,955,956,957,958,959,960,961,963,962,964,965,966,967,968,969],
    		[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,18,19,20,21,22,23,24],
    		true,
    		false,
    		false
    	),
    	new cipher(
    		"Arabic",
    		"Arabic",
    		25, 64, 59,
    		[1575,1649,1650,1651,1653,1576,1580,1583,1607,1577,1608,1586,1581,1591,1610,1609,1603,1604,1605,1606,1587,1593,1601,1589,1602,1585,1588,1578,1579,1582,1584,1590,1592,1594],
    		[1,1,1,1,1,2,3,4,5,5,6,7,8,9,10,10,20,30,40,50,60,70,80,90,100,200,300,400,500,600,700,800,900,1000],
    		true,
    		false,
    		false
    	),
    	new cipher(
    		"Arabic Ordinal",
    		"Arabic",
    		25, 59, 64,
    		[1575,1649,1650,1651,1653,1576,1580,1583,1607,1577,1608,1586,1581,1591,1610,1609,1603,1604,1605,1606,1587,1593,1601,1589,1602,1585,1588,1578,1579,1582,1584,1590,1592,1594],
    		[1,1,1,1,1,2,3,4,5,5,6,7,8,9,10,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28],
    		true,
    		false,
    		false
    	),
    	new cipher(
    		"Arabic Reduction",
    		"Arabic",
    		25, 54, 69,
    		[1575,1649,1650,1651,1653,1576,1580,1583,1607,1577,1608,1586,1581,1591,1610,1609,1603,1604,1605,1606,1587,1593,1601,1589,1602,1585,1588,1578,1579,1582,1584,1590,1592,1594],
    		[1,1,1,1,1,2,3,4,5,5,6,7,8,9,1,1,2,3,4,5,6,7,8,9,1,2,3,4,5,6,7,8,9,1],
    		true,
    		false,
    		false
    	),
    	new cipher(
    		"Russian Ordinal",
    		"Russian",
    		120, 65, 62,
    		[1072,1073,1074,1075,1076,1077,1105,1078,1079,1080,1081,1082,1083,1084,1085,1086,1087,1088,1089,1090,1091,1092,1093,1094,1095,1096,1097,1098,1099,1100,1101,1102,1103],
    		[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33],
    		false,
    		false,
    		false
    	),
    	new cipher(
    		"Russian Reduction",
    		"Russian",
    		216, 95, 73,
    		[1072,1073,1074,1075,1076,1077,1105,1078,1079,1080,1081,1082,1083,1084,1085,1086,1087,1088,1089,1090,1091,1092,1093,1094,1095,1096,1097,1098,1099,1100,1101,1102,1103],
    		[1,2,3,4,5,6,7,8,9,1,2,3,4,5,6,7,8,9,1,2,3,4,5,6,7,8,9,1,2,3,4,5,6],
    		false,
    		false,
    		false
    	),
    	new cipher(
    		"Russian R Ordinal",
    		"Russian",
    		146, 74, 50,
    		[1072,1073,1074,1075,1076,1077,1105,1078,1079,1080,1081,1082,1083,1084,1085,1086,1087,1088,1089,1090,1091,1092,1093,1094,1095,1096,1097,1098,1099,1100,1101,1102,1103],
    		[33,32,31,30,29,28,27,26,25,24,23,22,21,20,19,18,17,16,15,14,13,12,11,10,9,8,7,6,5,4,3,2,1],
    		false,
    		false,
    		false
    	),
    	new cipher(
    		"Russian R Reduction",
    		"Russian",
    		180, 60, 69,
    		[1072,1073,1074,1075,1076,1077,1105,1078,1079,1080,1081,1082,1083,1084,1085,1086,1087,1088,1089,1090,1091,1092,1093,1094,1095,1096,1097,1098,1099,1100,1101,1102,1103],
    		[6,5,4,3,2,1,9,8,7,6,5,4,3,2,1,9,8,7,6,5,4,3,2,1,9,8,7,6,5,4,3,2,1],
    		false,
    		false,
    		false
    	),
    	new cipher(
    		"Full KV Reduction",
    		"Extra",
    		200, 77, 63,
    		[97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122],
    		[1,2,3,4,5,6,7,8,9,1,11,3,4,5,6,7,8,9,1,2,3,22,5,6,7,8],
    		true,
    		false,
    		false
    	),
    	new cipher(
    		"Reverse EP Reduction",
    		"Extra",
    		165, 40, 56,
    		[97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122],
    		[8,7,6,5,22,3,2,1,9,8,7,6,5,4,3,11,1,9,8,7,6,5,4,3,2,1],
    		true,
    		false,
    		false
    	),
    	new cipher(
    		"Single Reduction",
    		"Extra",
    		219, 51, 68,
    		[97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122],
    		[1,2,3,4,5,6,7,8,9,1,2,3,4,5,6,7,8,9,10,2,3,4,5,6,7,8],
    		true,
    		false,
    		false
    	),
    	new cipher(
    		"Reverse S Reduction",
    		"Extra",
    		176, 20, 56,
    		[97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122],
    		[8,7,6,5,4,3,2,10,9,8,7,6,5,4,3,2,1,9,8,7,6,5,4,3,2,1],
    		true,
    		false,
    		false
    	),
    	new cipher(
    		"Single KV Reduction",
    		"Extra",
    		204, 79, 64,
    		[97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122],
    		[1,2,3,4,5,6,7,8,9,1,11,3,4,5,6,7,8,9,10,2,3,22,5,6,7,8],
    		true,
    		false,
    		false
    	),
    	new cipher(
    		"Reverse S EP Reduction",
    		"Extra",
    		144, 21, 54,
    		[97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122],
    		[8,7,6,5,22,3,2,10,9,8,7,6,5,4,3,11,1,9,8,7,6,5,4,3,2,1],
    		true,
    		false,
    		false
    	),
    	new cipher(
    		"Satanic",
    		"Extra",
    		350, 55, 61,
    		[97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122],
    		[36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61],
    		true,
    		false,
    		false
    	),
    	new cipher(
    		"Reverse Satanic",
    		"Extra",
    		350, 55, 69,
    		[97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122],
    		[61,60,59,58,57,56,55,54,53,52,51,50,49,48,47,46,45,44,43,42,41,40,39,38,37,36],
    		true,
    		false,
    		false
    	),
    	new cipher(
    		"Primes",
    		"Extra",
    		44, 56, 62,
    		[97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122],
    		[2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97,101],
    		true,
    		false,
    		false
    	),
    	new cipher(
    		"Reverse Primes",
    		"Extra",
    		35, 46, 62,
    		[97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122],
    		[101,97,89,83,79,73,71,67,61,59,53,47,43,41,37,31,29,23,19,17,13,11,7,5,3,2],
    		true,
    		false,
    		false
    	),
    	new cipher(
    		"Trigonal",
    		"Extra",
    		34, 47, 59,
    		[97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122],
    		[1,3,6,10,15,21,28,36,45,55,66,78,91,105,120,136,153,171,190,210,231,253,276,300,325,351],
    		true,
    		false,
    		false
    	),
    	new cipher(
    		"Reverse Trigonal",
    		"Extra",
    		23, 43, 53,
    		[97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122],
    		[351,325,300,276,253,231,210,190,171,153,136,120,105,91,78,66,55,45,36,28,21,15,10,6,3,1],
    		true,
    		false,
    		false
    	),
    	new cipher(
    		"Squares",
    		"Extra",
    		55, 39, 56,
    		[97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122],
    		[1,4,9,16,25,36,49,64,81,100,121,144,169,196,225,256,289,324,361,400,441,484,529,576,625,676],
    		true,
    		false,
    		false
    	),
    	new cipher(
    		"Reverse Squares",
    		"Extra",
    		58, 29, 53,
    		[97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122],
    		[676,625,576,529,484,441,400,361,324,289,256,225,196,169,144,121,100,81,64,49,36,25,16,9,4,1],
    		true,
    		false,
    		false
    	),
    	new cipher(
    		"Septenary",
    		"Extra",
    		37, 54, 55,
    		[97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122],
    		[1,2,3,4,5,6,7,6,5,4,3,2,1,1,2,3,4,5,6,7,6,5,4,3,2,1],
    		true,
    		false,
    		false
    	),
    	new cipher(
    		"Keypad",
    		"Extra",
    		300, 30, 72,
    		[97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122],
    		[2,2,2,3,3,3,4,4,4,5,5,5,6,6,6,7,7,7,7,8,8,8,9,9,9,9],
    		true,
    		false,
    		false
    	),
    	new cipher(
    		"Fibonacci",
    		"Extra",
    		25, 55, 70,
    		[97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122],
    		[1,1,2,3,5,8,13,21,34,55,89,144,233,233,144,89,55,34,21,13,8,5,3,2,1,1],
    		true,
    		false,
    		false
    	)
    ];

    const reducedCipherList = cipherList.filter((m, i) => i < maxCiphers );

    const shortcut = (node, params) => {
      let handler;
      const removeHandler = () => window.removeEventListener('keydown', handler), setHandler = () => {
          removeHandler();
          if (!params)
              return;
          handler = (e) => {
              if ((!!params.alt != e.altKey) ||
                  (!!params.shift != e.shiftKey) ||
                  (!!params.control != (e.ctrlKey || e.metaKey)) ||
                  params.code != e.code)
                  return;
              e.preventDefault();
              params.callback ? params.callback() : node.click();
          };
          window.addEventListener('keydown', handler);
      };
      setHandler();
      return {
          update: setHandler,
          destroy: removeHandler,
      };
    };

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    const triangularNumbers = writable([]);

    const fibonacciNumbers = writable([]);

    const number = 25;

    let n1 = 1, n2 = 1, nextTerm;

    console.log('Fibonacci Series:');

    let localArray = [];

    for (let i = 1; i <= number; i++) {
        console.log(i,n1);
        localArray.push(n1);
        nextTerm = n1 + n2;
        n1 = n2;
        n2 = nextTerm;
    }


    fibonacciNumbers.set(localArray);

    /* src/pages/TriangularNumbers.svelte generated by Svelte v3.46.4 */
    const file$4 = "src/pages/TriangularNumbers.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[9] = list[i];
    	child_ctx[10] = list;
    	child_ctx[11] = i;
    	return child_ctx;
    }

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[9] = list[i];
    	child_ctx[11] = i;
    	return child_ctx;
    }

    // (42:8) {#each triangleArray as triangularNumber, i}
    function create_each_block_1$1(ctx) {
    	let td;
    	let t_value = /*i*/ ctx[11] + 1 + "";
    	let t;

    	const block = {
    		c: function create() {
    			td = element("td");
    			t = text(t_value);
    			attr_dev(td, "class", "svelte-yzozqe");
    			add_location(td, file$4, 42, 10, 1056);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, td, anchor);
    			append_dev(td, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(td);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$1.name,
    		type: "each",
    		source: "(42:8) {#each triangleArray as triangularNumber, i}",
    		ctx
    	});

    	return block;
    }

    // (48:2) {#each triangleArray as triangularNumber, i}
    function create_each_block$2(ctx) {
    	let td;
    	let a;
    	let t0_value = /*triangularNumber*/ ctx[9] + "";
    	let t0;
    	let t1;
    	let t2;
    	let mounted;
    	let dispose;

    	function a_input_handler() {
    		/*a_input_handler*/ ctx[5].call(a, /*each_value*/ ctx[10], /*i*/ ctx[11]);
    	}

    	function click_handler_2() {
    		return /*click_handler_2*/ ctx[6](/*triangularNumber*/ ctx[9]);
    	}

    	const block = {
    		c: function create() {
    			td = element("td");
    			a = element("a");
    			t0 = text(t0_value);
    			t1 = text("  ");
    			t2 = space();
    			attr_dev(a, "href", "");
    			attr_dev(a, "contenteditable", "");
    			attr_dev(a, "class", "svelte-yzozqe");
    			if (/*triangularNumber*/ ctx[9] === void 0) add_render_callback(a_input_handler);
    			toggle_class(a, "triangularhighlight", /*triangularHighlight*/ ctx[1][/*triangularNumber*/ ctx[9]]);
    			add_location(a, file$4, 49, 4, 1159);
    			attr_dev(td, "class", "svelte-yzozqe");
    			add_location(td, file$4, 48, 2, 1150);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, td, anchor);
    			append_dev(td, a);
    			append_dev(a, t0);
    			append_dev(a, t1);

    			if (/*triangularNumber*/ ctx[9] !== void 0) {
    				a.innerHTML = /*triangularNumber*/ ctx[9];
    			}

    			append_dev(td, t2);

    			if (!mounted) {
    				dispose = [
    					listen_dev(a, "input", a_input_handler),
    					listen_dev(a, "click", prevent_default(click_handler_2), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*triangleArray*/ 1 && t0_value !== (t0_value = /*triangularNumber*/ ctx[9] + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*triangleArray*/ 1 && /*triangularNumber*/ ctx[9] !== a.innerHTML) {
    				a.innerHTML = /*triangularNumber*/ ctx[9];
    			}

    			if (dirty & /*triangularHighlight, triangleArray*/ 3) {
    				toggle_class(a, "triangularhighlight", /*triangularHighlight*/ ctx[1][/*triangularNumber*/ ctx[9]]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(td);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(48:2) {#each triangleArray as triangularNumber, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let div1;
    	let div0;
    	let t0;
    	let button0;
    	let t2;
    	let button1;
    	let t4;
    	let table;
    	let thead;
    	let tr;
    	let t5;
    	let mounted;
    	let dispose;
    	let each_value_1 = /*triangleArray*/ ctx[0];
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
    	}

    	let each_value = /*triangleArray*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			t0 = text("Triangular Numbers \n    ");
    			button0 = element("button");
    			button0.textContent = "clear";
    			t2 = space();
    			button1 = element("button");
    			button1.textContent = "select all";
    			t4 = space();
    			table = element("table");
    			thead = element("thead");
    			tr = element("tr");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t5 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(button0, file$4, 30, 4, 693);
    			add_location(button1, file$4, 33, 2, 819);
    			add_location(div0, file$4, 29, 2, 663);
    			add_location(tr, file$4, 40, 6, 988);
    			add_location(thead, file$4, 39, 4, 974);
    			attr_dev(table, "class", "svelte-yzozqe");
    			add_location(table, file$4, 38, 2, 962);
    			attr_dev(div1, "class", "numberbar svelte-yzozqe");
    			add_location(div1, file$4, 28, 0, 637);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, t0);
    			append_dev(div0, button0);
    			append_dev(div0, t2);
    			append_dev(div0, button1);
    			append_dev(div1, t4);
    			append_dev(div1, table);
    			append_dev(table, thead);
    			append_dev(thead, tr);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(tr, null);
    			}

    			append_dev(thead, t5);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(thead, null);
    			}

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*click_handler*/ ctx[3], false, false, false),
    					listen_dev(button1, "click", /*click_handler_1*/ ctx[4], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*triangleArray*/ 1) {
    				each_value_1 = /*triangleArray*/ ctx[0];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1$1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(tr, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (dirty & /*triangleArray, triangularHighlight, toggleHighlight*/ 7) {
    				each_value = /*triangleArray*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(thead, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const numbers = 50;

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('TriangularNumbers', slots, []);
    	let { triangleArray = [] } = $$props;

    	const triangular = number => {
    		const abs = Math.abs(number);
    		return abs / 2 * (abs + 1) * (abs / number) || 0;
    	};

    	let { triangularHighlight = {} } = $$props;

    	for (let index = 1; index < numbers; index++) {
    		const triangleNum = triangular(index);
    		triangleArray.push(triangleNum);
    		triangularHighlight[triangleNum] = true;
    	}

    	let number = '';

    	const toggleHighlight = num => {
    		$$invalidate(1, triangularHighlight[num] = !triangularHighlight[num], triangularHighlight);
    	};

    	triangularNumbers.set(triangleArray);
    	const writable_props = ['triangleArray', 'triangularHighlight'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<TriangularNumbers> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => {
    		for (const val in triangularHighlight) {
    			$$invalidate(1, triangularHighlight[val] = false, triangularHighlight);
    		}
    	};

    	const click_handler_1 = () => {
    		for (const val in triangularHighlight) {
    			$$invalidate(1, triangularHighlight[val] = true, triangularHighlight);
    		}
    	};

    	function a_input_handler(each_value, i) {
    		each_value[i] = this.innerHTML;
    		$$invalidate(0, triangleArray);
    	}

    	const click_handler_2 = triangularNumber => toggleHighlight(triangularNumber);

    	$$self.$$set = $$props => {
    		if ('triangleArray' in $$props) $$invalidate(0, triangleArray = $$props.triangleArray);
    		if ('triangularHighlight' in $$props) $$invalidate(1, triangularHighlight = $$props.triangularHighlight);
    	};

    	$$self.$capture_state = () => ({
    		triangularNumbers,
    		triangleArray,
    		triangular,
    		triangularHighlight,
    		numbers,
    		number,
    		toggleHighlight
    	});

    	$$self.$inject_state = $$props => {
    		if ('triangleArray' in $$props) $$invalidate(0, triangleArray = $$props.triangleArray);
    		if ('triangularHighlight' in $$props) $$invalidate(1, triangularHighlight = $$props.triangularHighlight);
    		if ('number' in $$props) number = $$props.number;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		triangleArray,
    		triangularHighlight,
    		toggleHighlight,
    		click_handler,
    		click_handler_1,
    		a_input_handler,
    		click_handler_2
    	];
    }

    class TriangularNumbers extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { triangleArray: 0, triangularHighlight: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TriangularNumbers",
    			options,
    			id: create_fragment$4.name
    		});
    	}

    	get triangleArray() {
    		throw new Error("<TriangularNumbers>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set triangleArray(value) {
    		throw new Error("<TriangularNumbers>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get triangularHighlight() {
    		throw new Error("<TriangularNumbers>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set triangularHighlight(value) {
    		throw new Error("<TriangularNumbers>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/pages/FibonacciNumbers.svelte generated by Svelte v3.46.4 */
    const file$3 = "src/pages/FibonacciNumbers.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	child_ctx[6] = list;
    	child_ctx[7] = i;
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i];
    	child_ctx[7] = i;
    	return child_ctx;
    }

    // (26:8) {#each $fibonacciNumbers as fibonacciNumber, i}
    function create_each_block_1(ctx) {
    	let td;
    	let t_value = /*i*/ ctx[7] + 1 + "";
    	let t;

    	const block = {
    		c: function create() {
    			td = element("td");
    			t = text(t_value);
    			attr_dev(td, "class", "svelte-elgc69");
    			add_location(td, file$3, 26, 10, 638);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, td, anchor);
    			append_dev(td, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(td);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(26:8) {#each $fibonacciNumbers as fibonacciNumber, i}",
    		ctx
    	});

    	return block;
    }

    // (32:2) {#each $fibonacciNumbers as triangularNumber, i}
    function create_each_block$1(ctx) {
    	let td;
    	let a;
    	let t0_value = /*triangularNumber*/ ctx[5] + "";
    	let t0;
    	let t1;
    	let t2;
    	let mounted;
    	let dispose;

    	function a_input_handler() {
    		/*a_input_handler*/ ctx[3].call(a, /*each_value*/ ctx[6], /*i*/ ctx[7]);
    	}

    	function click_handler() {
    		return /*click_handler*/ ctx[4](/*triangularNumber*/ ctx[5]);
    	}

    	const block = {
    		c: function create() {
    			td = element("td");
    			a = element("a");
    			t0 = text(t0_value);
    			t1 = text("  ");
    			t2 = space();
    			attr_dev(a, "href", "#");
    			attr_dev(a, "contenteditable", "");
    			attr_dev(a, "class", "svelte-elgc69");
    			if (/*triangularNumber*/ ctx[5] === void 0) add_render_callback(a_input_handler);
    			toggle_class(a, "fibonacciHighlight", /*fibonacciHighlight*/ ctx[0][/*triangularNumber*/ ctx[5]]);
    			add_location(a, file$3, 33, 4, 745);
    			attr_dev(td, "class", "svelte-elgc69");
    			add_location(td, file$3, 32, 2, 736);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, td, anchor);
    			append_dev(td, a);
    			append_dev(a, t0);
    			append_dev(a, t1);

    			if (/*triangularNumber*/ ctx[5] !== void 0) {
    				a.innerHTML = /*triangularNumber*/ ctx[5];
    			}

    			append_dev(td, t2);

    			if (!mounted) {
    				dispose = [
    					listen_dev(a, "input", a_input_handler),
    					listen_dev(a, "click", prevent_default(click_handler), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*$fibonacciNumbers*/ 2 && t0_value !== (t0_value = /*triangularNumber*/ ctx[5] + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*$fibonacciNumbers*/ 2 && /*triangularNumber*/ ctx[5] !== a.innerHTML) {
    				a.innerHTML = /*triangularNumber*/ ctx[5];
    			}

    			if (dirty & /*fibonacciHighlight, $fibonacciNumbers*/ 3) {
    				toggle_class(a, "fibonacciHighlight", /*fibonacciHighlight*/ ctx[0][/*triangularNumber*/ ctx[5]]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(td);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(32:2) {#each $fibonacciNumbers as triangularNumber, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let div1;
    	let div0;
    	let t1;
    	let table;
    	let thead;
    	let tr;
    	let t2;
    	let each_value_1 = /*$fibonacciNumbers*/ ctx[1];
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	let each_value = /*$fibonacciNumbers*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			div0.textContent = "Fibonnaci Numbers";
    			t1 = space();
    			table = element("table");
    			thead = element("thead");
    			tr = element("tr");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t2 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(div0, file$3, 13, 2, 239);
    			add_location(tr, file$3, 24, 6, 567);
    			add_location(thead, file$3, 23, 4, 553);
    			attr_dev(table, "class", "svelte-elgc69");
    			add_location(table, file$3, 22, 2, 541);
    			attr_dev(div1, "class", "numberbar svelte-elgc69");
    			add_location(div1, file$3, 12, 0, 213);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div1, t1);
    			append_dev(div1, table);
    			append_dev(table, thead);
    			append_dev(thead, tr);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(tr, null);
    			}

    			append_dev(thead, t2);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(thead, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$fibonacciNumbers*/ 2) {
    				each_value_1 = /*$fibonacciNumbers*/ ctx[1];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(tr, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (dirty & /*$fibonacciNumbers, fibonacciHighlight, toggleHighlight*/ 7) {
    				each_value = /*$fibonacciNumbers*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(thead, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let $fibonacciNumbers;
    	validate_store(fibonacciNumbers, 'fibonacciNumbers');
    	component_subscribe($$self, fibonacciNumbers, $$value => $$invalidate(1, $fibonacciNumbers = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('FibonacciNumbers', slots, []);
    	let { fibonacciHighlight = {} } = $$props;

    	const toggleHighlight = num => {
    		$$invalidate(0, fibonacciHighlight[num] = !fibonacciHighlight[num], fibonacciHighlight);
    	};

    	const writable_props = ['fibonacciHighlight'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<FibonacciNumbers> was created with unknown prop '${key}'`);
    	});

    	function a_input_handler(each_value, i) {
    		each_value[i] = this.innerHTML;
    		fibonacciNumbers.set($fibonacciNumbers);
    	}

    	const click_handler = triangularNumber => toggleHighlight(triangularNumber);

    	$$self.$$set = $$props => {
    		if ('fibonacciHighlight' in $$props) $$invalidate(0, fibonacciHighlight = $$props.fibonacciHighlight);
    	};

    	$$self.$capture_state = () => ({
    		fibonacciNumbers,
    		fibonacciHighlight,
    		toggleHighlight,
    		$fibonacciNumbers
    	});

    	$$self.$inject_state = $$props => {
    		if ('fibonacciHighlight' in $$props) $$invalidate(0, fibonacciHighlight = $$props.fibonacciHighlight);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		fibonacciHighlight,
    		$fibonacciNumbers,
    		toggleHighlight,
    		a_input_handler,
    		click_handler
    	];
    }

    class FibonacciNumbers extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { fibonacciHighlight: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "FibonacciNumbers",
    			options,
    			id: create_fragment$3.name
    		});
    	}

    	get fibonacciHighlight() {
    		throw new Error("<FibonacciNumbers>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fibonacciHighlight(value) {
    		throw new Error("<FibonacciNumbers>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Clipboard.svelte generated by Svelte v3.46.4 */

    const { console: console_1$1 } = globals;
    const file$2 = "src/components/Clipboard.svelte";

    // (39:0) {#if valueCopy != null}
    function create_if_block$1(ctx) {
    	let textarea;

    	const block = {
    		c: function create() {
    			textarea = element("textarea");
    			textarea.value = /*valueCopy*/ ctx[0];
    			attr_dev(textarea, "class", "svelte-1nfeb0s");
    			add_location(textarea, file$2, 39, 2, 830);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, textarea, anchor);
    			/*textarea_binding*/ ctx[5](textarea);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*valueCopy*/ 1) {
    				prop_dev(textarea, "value", /*valueCopy*/ ctx[0]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(textarea);
    			/*textarea_binding*/ ctx[5](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(39:0) {#if valueCopy != null}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let t0;
    	let svg;
    	let path;
    	let t1;
    	let button;
    	let mounted;
    	let dispose;
    	let if_block = /*valueCopy*/ ctx[0] != null && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			t0 = space();
    			svg = svg_element("svg");
    			path = svg_element("path");
    			t1 = space();
    			button = element("button");
    			button.textContent = "paste";
    			attr_dev(path, "fill-rule", "evenodd");
    			attr_dev(path, "d", "M2 13h4v1H2v-1zm5-6H2v1h5V7zm2 3V8l-3 3 3 3v-2h5v-2H9zM4.5 9H2v1h2.5V9zM2 12h2.5v-1H2v1zm9 1h1v2c-.02.28-.11.52-.3.7-.19.18-.42.28-.7.3H1c-.55 0-1-.45-1-1V4c0-.55.45-1 1-1h3c0-1.11.89-2 2-2 1.11 0 2 .89 2 2h3c.55 0 1 .45 1 1v5h-1V6H1v9h10v-2zM2 5h8c0-.55-.45-1-1-1H8c-.55 0-1-.45-1-1s-.45-1-1-1-1 .45-1 1-.45 1-1 1H3c-.55 0-1 .45-1 1z");
    			add_location(path, file$2, 50, 1, 1069);
    			attr_dev(svg, "title", "Copy to clipboard");
    			attr_dev(svg, "class", "octicon octicon-clippy svelte-1nfeb0s");
    			attr_dev(svg, "viewBox", "0 0 14 16");
    			attr_dev(svg, "version", "1.1");
    			attr_dev(svg, "width", "14");
    			attr_dev(svg, "height", "16");
    			attr_dev(svg, "aria-hidden", "true");
    			add_location(svg, file$2, 41, 0, 891);
    			add_location(button, file$2, 54, 0, 1454);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(svg, "click", /*copy*/ ctx[2], false, false, false),
    					listen_dev(button, "click", prevent_default(/*click_handler*/ ctx[6]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*valueCopy*/ ctx[0] != null) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					if_block.m(t0.parentNode, t0);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(svg);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(button);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Clipboard', slots, []);
    	let valueCopy = null;
    	let { value = null } = $$props;
    	let areaDom;

    	async function copy() {
    		$$invalidate(0, valueCopy = value);
    		await tick();
    		areaDom.focus();
    		areaDom.select();
    		let message = 'Copying text was successful';

    		try {
    			const successful = document.execCommand('copy');

    			if (!successful) {
    				message = 'Copying text was unsuccessful';
    			}
    		} catch(err) {
    			message = 'Oops, unable to copy';
    		}

    		// we can notifi by event or storage about copy status
    		console.log(message);

    		$$invalidate(0, valueCopy = null);
    	}

    	const paste = async () => {
    		if (navigator.clipboard) {
    			console.log('found clipboard');
    		} else {
    			console.log('clipsboard not found');
    		}

    		const text = await navigator.clipboard.readText();
    		console.log(text);
    	};

    	const writable_props = ['value'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$1.warn(`<Clipboard> was created with unknown prop '${key}'`);
    	});

    	function textarea_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			areaDom = $$value;
    			$$invalidate(1, areaDom);
    		});
    	}

    	const click_handler = e => paste(e);

    	$$self.$$set = $$props => {
    		if ('value' in $$props) $$invalidate(4, value = $$props.value);
    	};

    	$$self.$capture_state = () => ({
    		tick,
    		valueCopy,
    		value,
    		areaDom,
    		copy,
    		paste
    	});

    	$$self.$inject_state = $$props => {
    		if ('valueCopy' in $$props) $$invalidate(0, valueCopy = $$props.valueCopy);
    		if ('value' in $$props) $$invalidate(4, value = $$props.value);
    		if ('areaDom' in $$props) $$invalidate(1, areaDom = $$props.areaDom);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [valueCopy, areaDom, copy, paste, value, textarea_binding, click_handler];
    }

    class Clipboard extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { value: 4 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Clipboard",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get value() {
    		throw new Error("<Clipboard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Clipboard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/pages/Decoder.svelte generated by Svelte v3.46.4 */

    const { console: console_1 } = globals;
    const file$1 = "src/pages/Decoder.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[43] = list[i];
    	child_ctx[45] = i;
    	return child_ctx;
    }

    // (309:42) {:else}
    function create_else_block_2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("only highlighted");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_2.name,
    		type: "else",
    		source: "(309:42) {:else}",
    		ctx
    	});

    	return block;
    }

    // (309:5) {#if params.onlyShowHighlighted}
    function create_if_block_2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("all");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(309:5) {#if params.onlyShowHighlighted}",
    		ctx
    	});

    	return block;
    }

    // (313:37) {:else}
    function create_else_block_1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("hide");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(313:37) {:else}",
    		ctx
    	});

    	return block;
    }

    // (313:5) {#if params.ignoreTrivial}
    function create_if_block_1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("show");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(313:5) {#if params.ignoreTrivial}",
    		ctx
    	});

    	return block;
    }

    // (316:34) {:else}
    function create_else_block(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("show");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(316:34) {:else}",
    		ctx
    	});

    	return block;
    }

    // (316:5) {#if params.showValues}
    function create_if_block(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("hide");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(316:5) {#if params.showValues}",
    		ctx
    	});

    	return block;
    }

    // (323:5) {#each cipherList as cipher, i}
    function create_each_block(ctx) {
    	let option;
    	let t0_value = /*i*/ ctx[45] + 1 + "";
    	let t0;
    	let t1;
    	let t2_value = /*cipher*/ ctx[43].cipherName + "";
    	let t2;
    	let t3;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t0 = text(t0_value);
    			t1 = text(": ");
    			t2 = text(t2_value);
    			t3 = space();
    			option.__value = /*i*/ ctx[45];
    			option.value = option.__value;
    			add_location(option, file$1, 323, 6, 9084);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t0);
    			append_dev(option, t1);
    			append_dev(option, t2);
    			append_dev(option, t3);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(323:5) {#each cipherList as cipher, i}",
    		ctx
    	});

    	return block;
    }

    // (399:3) {#key triangularHighlight}
    function create_key_block_1(ctx) {
    	let html_tag;
    	let raw_value = /*decode*/ ctx[14](/*text*/ ctx[2]).replace(/<br><br>/g, "<br>") + "";
    	let html_anchor;

    	const block = {
    		c: function create() {
    			html_tag = new HtmlTag();
    			html_anchor = empty();
    			html_tag.a = html_anchor;
    		},
    		m: function mount(target, anchor) {
    			html_tag.m(raw_value, target, anchor);
    			insert_dev(target, html_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*text*/ 4 && raw_value !== (raw_value = /*decode*/ ctx[14](/*text*/ ctx[2]).replace(/<br><br>/g, "<br>") + "")) html_tag.p(raw_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(html_anchor);
    			if (detaching) html_tag.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_key_block_1.name,
    		type: "key",
    		source: "(399:3) {#key triangularHighlight}",
    		ctx
    	});

    	return block;
    }

    // (398:2) {#key selectedCipher}
    function create_key_block(ctx) {
    	let previous_key = /*triangularHighlight*/ ctx[3];
    	let key_block_anchor;
    	let key_block = create_key_block_1(ctx);

    	const block = {
    		c: function create() {
    			key_block.c();
    			key_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			key_block.m(target, anchor);
    			insert_dev(target, key_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*triangularHighlight*/ 8 && safe_not_equal(previous_key, previous_key = /*triangularHighlight*/ ctx[3])) {
    				key_block.d(1);
    				key_block = create_key_block_1(ctx);
    				key_block.c();
    				key_block.m(key_block_anchor.parentNode, key_block_anchor);
    			} else {
    				key_block.p(ctx, dirty);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(key_block_anchor);
    			key_block.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_key_block.name,
    		type: "key",
    		source: "(398:2) {#key selectedCipher}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let main;
    	let div0;
    	let center;
    	let triangularnumbers;
    	let updating_triangularHighlight;
    	let t0;
    	let fibonaccinumbers;
    	let t1;
    	let nav;
    	let button0;
    	let t3;
    	let button1;
    	let t5;
    	let input0;
    	let t6;
    	let input1;
    	let t7;
    	let input2;
    	let t8;
    	let button2;
    	let t10;
    	let button3;
    	let t11;
    	let t12;
    	let button4;
    	let t13;
    	let t14;
    	let button5;
    	let t15;
    	let t16;
    	let button6;
    	let t18;
    	let select;
    	let shortcut_action;
    	let t19;
    	let button7;
    	let svg0;
    	let path0;
    	let t20;
    	let button8;
    	let svg1;
    	let path1;
    	let t21;
    	let input3;
    	let t22;
    	let button9;
    	let t24;
    	let button10;
    	let t26;
    	let textinput;
    	let updating_value;
    	let t27;
    	let t28_value = /*cipherString*/ ctx[8]() + "";
    	let t28;
    	let t29;
    	let div1;
    	let previous_key = /*selectedCipher*/ ctx[0];
    	let div1_transition;
    	let current;
    	let mounted;
    	let dispose;

    	function triangularnumbers_triangularHighlight_binding(value) {
    		/*triangularnumbers_triangularHighlight_binding*/ ctx[17](value);
    	}

    	let triangularnumbers_props = {};

    	if (/*triangularHighlight*/ ctx[3] !== void 0) {
    		triangularnumbers_props.triangularHighlight = /*triangularHighlight*/ ctx[3];
    	}

    	triangularnumbers = new TriangularNumbers({
    			props: triangularnumbers_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(triangularnumbers, 'triangularHighlight', triangularnumbers_triangularHighlight_binding));
    	fibonaccinumbers = new FibonacciNumbers({ $$inline: true });

    	function select_block_type(ctx, dirty) {
    		if (/*params*/ ctx[4].onlyShowHighlighted) return create_if_block_2;
    		return create_else_block_2;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block0 = current_block_type(ctx);

    	function select_block_type_1(ctx, dirty) {
    		if (/*params*/ ctx[4].ignoreTrivial) return create_if_block_1;
    		return create_else_block_1;
    	}

    	let current_block_type_1 = select_block_type_1(ctx);
    	let if_block1 = current_block_type_1(ctx);

    	function select_block_type_2(ctx, dirty) {
    		if (/*params*/ ctx[4].showValues) return create_if_block;
    		return create_else_block;
    	}

    	let current_block_type_2 = select_block_type_2(ctx);
    	let if_block2 = current_block_type_2(ctx);
    	let each_value = reducedCipherList;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	function textinput_value_binding(value) {
    		/*textinput_value_binding*/ ctx[30](value);
    	}

    	let textinput_props = {
    		shortcut,
    		label: "Text to decode",
    		multiline: true
    	};

    	if (/*text*/ ctx[2] !== void 0) {
    		textinput_props.value = /*text*/ ctx[2];
    	}

    	textinput = new TextInput({ props: textinput_props, $$inline: true });
    	binding_callbacks.push(() => bind(textinput, 'value', textinput_value_binding));
    	let key_block = create_key_block(ctx);

    	const block = {
    		c: function create() {
    			main = element("main");
    			div0 = element("div");
    			center = element("center");
    			create_component(triangularnumbers.$$.fragment);
    			t0 = space();
    			create_component(fibonaccinumbers.$$.fragment);
    			t1 = space();
    			nav = element("nav");
    			button0 = element("button");
    			button0.textContent = "Paste text";
    			t3 = space();
    			button1 = element("button");
    			button1.textContent = "Clear text";
    			t5 = space();
    			input0 = element("input");
    			t6 = space();
    			input1 = element("input");
    			t7 = space();
    			input2 = element("input");
    			t8 = space();
    			button2 = element("button");
    			button2.textContent = "go";
    			t10 = space();
    			button3 = element("button");
    			t11 = text("show\n\t\t\t\t\t");
    			if_block0.c();
    			t12 = space();
    			button4 = element("button");
    			if_block1.c();
    			t13 = text(" trivial");
    			t14 = space();
    			button5 = element("button");
    			if_block2.c();
    			t15 = text(" values");
    			t16 = space();
    			button6 = element("button");
    			button6.textContent = "cipher info";
    			t18 = space();
    			select = element("select");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t19 = space();
    			button7 = element("button");
    			svg0 = svg_element("svg");
    			path0 = svg_element("path");
    			t20 = space();
    			button8 = element("button");
    			svg1 = svg_element("svg");
    			path1 = svg_element("path");
    			t21 = space();
    			input3 = element("input");
    			t22 = space();
    			button9 = element("button");
    			button9.textContent = "go";
    			t24 = space();
    			button10 = element("button");
    			button10.textContent = "Sorted Results";
    			t26 = space();
    			create_component(textinput.$$.fragment);
    			t27 = space();
    			t28 = text(t28_value);
    			t29 = space();
    			div1 = element("div");
    			key_block.c();
    			add_location(button0, file$1, 284, 4, 7818);
    			add_location(button1, file$1, 285, 4, 7871);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "placeholder", "quick decode");
    			attr_dev(input0, "class", "svelte-6513dc");
    			add_location(input0, file$1, 286, 4, 7932);
    			attr_dev(input1, "type", "text");
    			input1.readOnly = true;
    			attr_dev(input1, "class", "numberbox svelte-6513dc");
    			add_location(input1, file$1, 287, 4, 8008);
    			attr_dev(input2, "type", "text");
    			attr_dev(input2, "placeholder", "number search");
    			attr_dev(input2, "class", "svelte-6513dc");
    			add_location(input2, file$1, 300, 4, 8250);
    			add_location(button2, file$1, 305, 4, 8348);
    			add_location(button3, file$1, 306, 4, 8419);
    			add_location(button4, file$1, 311, 4, 8586);
    			add_location(button5, file$1, 314, 4, 8727);
    			add_location(button6, file$1, 317, 4, 8861);
    			attr_dev(select, "class", "svelte-6513dc");
    			if (/*selectedCipher*/ ctx[0] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[26].call(select));
    			add_location(select, file$1, 318, 4, 8919);
    			attr_dev(path0, "fill-rule", "evenodd");
    			attr_dev(path0, "d", "M15 2a1 1 0 0 0-1-1H2a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V2zM0 2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2zm11.5 5.5a.5.5 0 0 1 0 1H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5H11.5z");
    			add_location(path0, file$1, 342, 6, 9550);
    			attr_dev(svg0, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg0, "width", "16");
    			attr_dev(svg0, "height", "16");
    			attr_dev(svg0, "fill", "currentColor");
    			attr_dev(svg0, "class", "bi bi-arrow-left-square");
    			attr_dev(svg0, "viewBox", "0 0 16 16");
    			add_location(svg0, file$1, 334, 5, 9366);
    			add_location(button7, file$1, 330, 4, 9243);
    			attr_dev(path1, "fill-rule", "evenodd");
    			attr_dev(path1, "d", "M15 2a1 1 0 0 0-1-1H2a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V2zM0 2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2zm4.5 5.5a.5.5 0 0 0 0 1h5.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3a.5.5 0 0 0 0-.708l-3-3a.5.5 0 1 0-.708.708L10.293 7.5H4.5z");
    			add_location(path1, file$1, 360, 6, 10195);
    			attr_dev(svg1, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg1, "width", "16");
    			attr_dev(svg1, "height", "16");
    			attr_dev(svg1, "fill", "currentColor");
    			attr_dev(svg1, "class", "bi bi-arrow-right-square");
    			attr_dev(svg1, "viewBox", "0 0 16 16");
    			add_location(svg1, file$1, 352, 5, 10010);
    			add_location(button8, file$1, 348, 4, 9902);
    			attr_dev(input3, "type", "text");
    			attr_dev(input3, "class", "numberbox svelte-6513dc");
    			attr_dev(input3, "placeholder", "number lookup");
    			add_location(input3, file$1, 367, 4, 10548);
    			add_location(button9, file$1, 373, 4, 10670);
    			button10.disabled = true;
    			add_location(button10, file$1, 379, 4, 10838);
    			add_location(nav, file$1, 282, 3, 7778);
    			add_location(center, file$1, 278, 2, 7688);
    			attr_dev(div0, "class", "fixed svelte-6513dc");
    			add_location(div0, file$1, 277, 1, 7666);
    			attr_dev(div1, "class", "decoded svelte-6513dc");
    			add_location(div1, file$1, 392, 1, 11044);
    			attr_dev(main, "class", "svelte-6513dc");
    			add_location(main, file$1, 276, 0, 7658);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div0);
    			append_dev(div0, center);
    			mount_component(triangularnumbers, center, null);
    			append_dev(center, t0);
    			mount_component(fibonaccinumbers, center, null);
    			append_dev(center, t1);
    			append_dev(center, nav);
    			append_dev(nav, button0);
    			append_dev(nav, t3);
    			append_dev(nav, button1);
    			append_dev(nav, t5);
    			append_dev(nav, input0);
    			set_input_value(input0, /*quickWord*/ ctx[1]);
    			append_dev(nav, t6);
    			append_dev(nav, input1);
    			set_input_value(input1, /*quickDecode*/ ctx[7]);
    			append_dev(nav, t7);
    			append_dev(nav, input2);
    			set_input_value(input2, /*numberSearch*/ ctx[6]);
    			append_dev(nav, t8);
    			append_dev(nav, button2);
    			append_dev(nav, t10);
    			append_dev(nav, button3);
    			append_dev(button3, t11);
    			if_block0.m(button3, null);
    			append_dev(nav, t12);
    			append_dev(nav, button4);
    			if_block1.m(button4, null);
    			append_dev(button4, t13);
    			append_dev(nav, t14);
    			append_dev(nav, button5);
    			if_block2.m(button5, null);
    			append_dev(button5, t15);
    			append_dev(nav, t16);
    			append_dev(nav, button6);
    			append_dev(nav, t18);
    			append_dev(nav, select);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_option(select, /*selectedCipher*/ ctx[0]);
    			append_dev(nav, t19);
    			append_dev(nav, button7);
    			append_dev(button7, svg0);
    			append_dev(svg0, path0);
    			append_dev(nav, t20);
    			append_dev(nav, button8);
    			append_dev(button8, svg1);
    			append_dev(svg1, path1);
    			append_dev(nav, t21);
    			append_dev(nav, input3);
    			set_input_value(input3, /*numberLookup*/ ctx[5]);
    			append_dev(nav, t22);
    			append_dev(nav, button9);
    			append_dev(nav, t24);
    			append_dev(nav, button10);
    			append_dev(center, t26);
    			mount_component(textinput, center, null);
    			append_dev(center, t27);
    			append_dev(center, t28);
    			append_dev(main, t29);
    			append_dev(main, div1);
    			key_block.m(div1, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*pasteText*/ ctx[15], false, false, false),
    					listen_dev(button1, "click", /*click_handler*/ ctx[18], false, false, false),
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[19]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[20]),
    					listen_dev(input2, "input", /*input2_input_handler*/ ctx[21]),
    					listen_dev(button2, "click", /*click_handler_1*/ ctx[22], false, false, false),
    					listen_dev(button3, "click", /*click_handler_2*/ ctx[23], false, false, false),
    					listen_dev(button4, "click", /*click_handler_3*/ ctx[24], false, false, false),
    					listen_dev(button5, "click", /*click_handler_4*/ ctx[25], false, false, false),
    					listen_dev(button6, "click", /*displayCipher*/ ctx[11], false, false, false),
    					listen_dev(select, "change", /*select_change_handler*/ ctx[26]),
    					action_destroyer(shortcut_action = shortcut.call(null, select, {
    						code: "Home",
    						callback: /*shortcut_function*/ ctx[27]
    					})),
    					listen_dev(button7, "click", /*cycleBackward*/ ctx[12], false, false, false),
    					action_destroyer(shortcut.call(null, button7, {
    						shift: true,
    						code: "Tab",
    						callback: /*cycleBackward*/ ctx[12]
    					})),
    					listen_dev(button8, "click", /*cycleForward*/ ctx[13], false, false, false),
    					action_destroyer(shortcut.call(null, button8, {
    						code: "Tab",
    						callback: /*cycleForward*/ ctx[13]
    					})),
    					listen_dev(input3, "input", /*input3_input_handler*/ ctx[28]),
    					listen_dev(button9, "click", /*click_handler_5*/ ctx[29], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const triangularnumbers_changes = {};

    			if (!updating_triangularHighlight && dirty[0] & /*triangularHighlight*/ 8) {
    				updating_triangularHighlight = true;
    				triangularnumbers_changes.triangularHighlight = /*triangularHighlight*/ ctx[3];
    				add_flush_callback(() => updating_triangularHighlight = false);
    			}

    			triangularnumbers.$set(triangularnumbers_changes);

    			if (dirty[0] & /*quickWord*/ 2 && input0.value !== /*quickWord*/ ctx[1]) {
    				set_input_value(input0, /*quickWord*/ ctx[1]);
    			}

    			if (dirty[0] & /*quickDecode*/ 128 && input1.value !== /*quickDecode*/ ctx[7]) {
    				set_input_value(input1, /*quickDecode*/ ctx[7]);
    			}

    			if (dirty[0] & /*numberSearch*/ 64 && input2.value !== /*numberSearch*/ ctx[6]) {
    				set_input_value(input2, /*numberSearch*/ ctx[6]);
    			}

    			if (current_block_type !== (current_block_type = select_block_type(ctx))) {
    				if_block0.d(1);
    				if_block0 = current_block_type(ctx);

    				if (if_block0) {
    					if_block0.c();
    					if_block0.m(button3, null);
    				}
    			}

    			if (current_block_type_1 !== (current_block_type_1 = select_block_type_1(ctx))) {
    				if_block1.d(1);
    				if_block1 = current_block_type_1(ctx);

    				if (if_block1) {
    					if_block1.c();
    					if_block1.m(button4, t13);
    				}
    			}

    			if (current_block_type_2 !== (current_block_type_2 = select_block_type_2(ctx))) {
    				if_block2.d(1);
    				if_block2 = current_block_type_2(ctx);

    				if (if_block2) {
    					if_block2.c();
    					if_block2.m(button5, t15);
    				}
    			}

    			if (dirty & /*cipherList*/ 0) {
    				each_value = reducedCipherList;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty[0] & /*selectedCipher*/ 1) {
    				select_option(select, /*selectedCipher*/ ctx[0]);
    			}

    			if (shortcut_action && is_function(shortcut_action.update) && dirty[0] & /*selectedCipher*/ 1) shortcut_action.update.call(null, {
    				code: "Home",
    				callback: /*shortcut_function*/ ctx[27]
    			});

    			if (dirty[0] & /*numberLookup*/ 32 && input3.value !== /*numberLookup*/ ctx[5]) {
    				set_input_value(input3, /*numberLookup*/ ctx[5]);
    			}

    			const textinput_changes = {};

    			if (!updating_value && dirty[0] & /*text*/ 4) {
    				updating_value = true;
    				textinput_changes.value = /*text*/ ctx[2];
    				add_flush_callback(() => updating_value = false);
    			}

    			textinput.$set(textinput_changes);
    			if ((!current || dirty[0] & /*cipherString*/ 256) && t28_value !== (t28_value = /*cipherString*/ ctx[8]() + "")) set_data_dev(t28, t28_value);

    			if (dirty[0] & /*selectedCipher*/ 1 && safe_not_equal(previous_key, previous_key = /*selectedCipher*/ ctx[0])) {
    				key_block.d(1);
    				key_block = create_key_block(ctx);
    				key_block.c();
    				key_block.m(div1, null);
    			} else {
    				key_block.p(ctx, dirty);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(triangularnumbers.$$.fragment, local);
    			transition_in(fibonaccinumbers.$$.fragment, local);
    			transition_in(textinput.$$.fragment, local);

    			add_render_callback(() => {
    				if (!div1_transition) div1_transition = create_bidirectional_transition(div1, scale, { duration: 1000, easing: cubicOut }, true);
    				div1_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(triangularnumbers.$$.fragment, local);
    			transition_out(fibonaccinumbers.$$.fragment, local);
    			transition_out(textinput.$$.fragment, local);
    			if (!div1_transition) div1_transition = create_bidirectional_transition(div1, scale, { duration: 1000, easing: cubicOut }, false);
    			div1_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(triangularnumbers);
    			destroy_component(fibonaccinumbers);
    			if_block0.d();
    			if_block1.d();
    			if_block2.d();
    			destroy_each(each_blocks, detaching);
    			destroy_component(textinput);
    			key_block.d(detaching);
    			if (detaching && div1_transition) div1_transition.end();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let specialNumbers;
    	let currentCipher;
    	let cipherString;
    	let quickDecode;
    	let $triangularNumbers;
    	validate_store(triangularNumbers, 'triangularNumbers');
    	component_subscribe($$self, triangularNumbers, $$value => $$invalidate(33, $triangularNumbers = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Decoder', slots, []);
    	let text = "";
    	let selectedCipher = 0;
    	let selected = 0;
    	let triangularHighlight = {};
    	let quickWord = "";

    	const params = {
    		ignoreTrivial: false,
    		onlyShowHighlighted: false,
    		showValues: true
    	};

    	let showValues = false;
    	let numberLookup = "";
    	let numberSearch = "";
    	let customNumberFilter = [];

    	const numberInfo = {
    		33: "https://www.reddit.com/r/GeometersOfHistory/wiki/spellcomponents/33",
    		42: "https://www.reddit.com/r/GeometersOfHistory/wiki/spellcomponents/42",
    		47: "https://www.reddit.com/r/GeometersOfHistory/wiki/spellcomponents/47",
    		74: "https://www.reddit.com/r/GeometersOfHistory/wiki/spellcomponents/74",
    		83: "https://www.reddit.com/r/GeometersOfHistory/wiki/spellcomponents/83",
    		120: "https://www.reddit.com/r/GeometersOfHistory/wiki/spellcomponents/120",
    		137: "https://www.reddit.com/r/GeometersOfHistory/wiki/spellcomponents/137",
    		201: "https://www.reddit.com/r/GeometersOfHistory/wiki/spellcomponents/201"
    	};

    	const trivialList = [
    		"a",
    		"is",
    		"or",
    		"of",
    		"if",
    		"at",
    		"the",
    		"also",
    		"for",
    		"said",
    		"then",
    		"his",
    		"has",
    		"was",
    		"and",
    		"was"
    	];

    	const addToHighlights = num => {
    		if (!customNumberFilter.includes(Number(num))) {
    			customNumberFilter = [...customNumberFilter, Number(num)];
    			$$invalidate(3, triangularHighlight);
    			console.log(customNumberFilter);
    			$$invalidate(6, numberSearch = '');
    		}
    	};

    	const toggleAndUpdate = key => {
    		$$invalidate(4, params[key] = !params[key], params);
    		$$invalidate(3, triangularHighlight);
    	};

    	const displayCipher = () => {
    		let letterValues = {};

    		for (const c of currentCipher.cArr) {
    			const letter = String.fromCharCode(c);
    			const val = currentCipher.vArr[currentCipher.cArr.indexOf(c)];
    			letterValues[letter] = val;
    		}
    		console.log(letterValues);

    		//console.log(JSON.stringify(letterValues, (key,value) => key + ": " + value , ''));
    		alert(JSON.stringify(letterValues, null, "") + JSON.stringify(currentCipher));
    	};

    	const cycleBackward = () => {
    		if (selectedCipher > 0) {
    			$$invalidate(0, selectedCipher -= 1);
    		} else {
    			$$invalidate(0, selectedCipher = reducedCipherList.length - 1);
    		}
    	};

    	const cycleForward = () => {
    		if (selectedCipher < reducedCipherList.length - 1) {
    			$$invalidate(0, selectedCipher += 1);
    		} else {
    			$$invalidate(0, selectedCipher = 0);
    		}
    	};

    	const valueOf = c => {
    		//console.log("character is ", c, c.charCodeAt(0));
    		//console.log(currentCipher.vArr);
    		const val = currentCipher.vArr[currentCipher.cArr.indexOf(c.charCodeAt(0))] || 0;

    		//console.log("value of ", c, " is ", val);
    		return val;
    	};

    	const evalWord = word => {
    		let val = 0;

    		for (const c of word.toLocaleLowerCase()) {
    			val += valueOf(c);
    		}

    		return val;
    	};

    	const simplify = word => {
    		if (typeof word !== "string") return word;
    		let simplified = "";

    		for (const c of word) {
    			if (currentCipher.vArr[currentCipher.cArr.indexOf(c.toLowerCase().charCodeAt(0))]) {
    				simplified += c;
    			}
    		}

    		return simplified;
    	};

    	const highlight = (text, customClass = "highlight") => {
    		let [word, value] = typeof text === "string" ? text.split(" ") : [text, 0];
    		if (!params.showValues) text = word;
    		if (typeof word === "number") word = word.toString();

    		if (params.ignoreTrivial && (trivialList.includes(simplify(word.toLowerCase())) || simplify(word).length < 3)) {
    			return params.onlyShowHighlighted ? "" : text;
    		} else {
    			if (numberInfo[value]) {
    				return `<a href='${numberInfo[value]}' class='${customClass}' target="_blank">${text}</a>`;
    			} else {
    				return `<span class='${customClass}'> ${text} </span>`;
    			}
    		}
    	};

    	const triangleHighlight = text => {
    		const word = simplify(text.split(" ")[0]);
    		if (!params.showValues) text = word;

    		if (params.ignoreTrivial && (trivialList.includes(word.toLowerCase()) || simplify(word).length < 3)) {
    			return params.onlyShowHighlighted ? "" : text;
    		} else {
    			return "<span class='triangle-highlight'>" + text + "</span>";
    		}
    	};

    	const decode = t => {
    		let decoded = "";
    		let combinedValue = { num: 0, html: "" };
    		let val = 0;

    		for (const line of t.split("\n")) {
    			combinedValue.num = 0;

    			for (const word of line.split(" ")) {
    				if (!word) continue;
    				val = evalWord(word);
    				combinedValue.num += val;

    				if (customNumberFilter.includes(val)) {
    					console.log("found", val);
    					const returnedValue = highlight(word + " " + val, "highlight2");
    					console.log("returnedValue =", returnedValue);

    					if (returnedValue) {
    						decoded += returnedValue + " ";
    					} else {
    						combinedValue.num -= val; //console.log("decoded =",decoded)
    					}
    				} else if (specialNumbers.includes(val)) {
    					//val = highlight(val);
    					const returnedValue = highlight(word + " " + val);

    					if (returnedValue) {
    						decoded += returnedValue + " ";
    					} else {
    						combinedValue.num -= val;
    					}
    				} else if (triangularHighlight[val] === true) {
    					const returnedValue = triangleHighlight(word + " " + val);

    					if (returnedValue) {
    						decoded += returnedValue + " ";
    					} else {
    						combinedValue.num -= val;
    					}
    				} else {
    					if (!params.onlyShowHighlighted) {
    						if (params.showValues) {
    							decoded += word + " " + val + " ";
    						} else {
    							decoded += word + " ";
    						}
    					} else {
    						combinedValue.num -= val;
    					}
    				}
    			}

    			if (customNumberFilter.includes(combinedValue.num)) {
    				combinedValue.html = highlight(combinedValue.num, "highlight2");
    			} else if ($triangularNumbers.includes(combinedValue.num)) {
    				combinedValue.html = "<span class='triangle-highlight'>" + combinedValue.num + "</span>";
    			} else if (specialNumbers.includes(combinedValue.num)) {
    				combinedValue.html = highlight(combinedValue.num);
    			} else {
    				combinedValue.html = combinedValue.num;
    			}

    			if (decoded.length > 0) {
    				decoded += combinedValue.num > 0 && params.showValues
    				? "(" + combinedValue.html + ")<br><br>"
    				: "<br>";
    			}
    		}

    		return decoded;
    	};

    	const pasteText = async () => {
    		if (navigator.clipboard) ; else {
    			console.log("clipsboard not found");
    		}

    		$$invalidate(2, text = await navigator.clipboard.readText());
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<Decoder> was created with unknown prop '${key}'`);
    	});

    	function triangularnumbers_triangularHighlight_binding(value) {
    		triangularHighlight = value;
    		$$invalidate(3, triangularHighlight);
    	}

    	const click_handler = () => $$invalidate(2, text = "");

    	function input0_input_handler() {
    		quickWord = this.value;
    		$$invalidate(1, quickWord);
    	}

    	function input1_input_handler() {
    		quickDecode = this.value;
    		(($$invalidate(7, quickDecode), $$invalidate(0, selectedCipher)), $$invalidate(1, quickWord));
    	}

    	function input2_input_handler() {
    		numberSearch = this.value;
    		$$invalidate(6, numberSearch);
    	}

    	const click_handler_1 = () => addToHighlights(numberSearch);
    	const click_handler_2 = () => toggleAndUpdate("onlyShowHighlighted");
    	const click_handler_3 = () => toggleAndUpdate("ignoreTrivial");
    	const click_handler_4 = () => toggleAndUpdate("showValues");

    	function select_change_handler() {
    		selectedCipher = select_value(this);
    		$$invalidate(0, selectedCipher);
    	}

    	const shortcut_function = () => $$invalidate(0, selectedCipher = 0);

    	function input3_input_handler() {
    		numberLookup = this.value;
    		$$invalidate(5, numberLookup);
    	}

    	const click_handler_5 = () => window.open(`https://www.reddit.com/r/GeometersOfHistory/wiki/spellcomponents/${numberLookup}`);

    	function textinput_value_binding(value) {
    		text = value;
    		$$invalidate(2, text);
    	}

    	$$self.$capture_state = () => ({
    		TextInput,
    		cipherList: reducedCipherList,
    		shortcut,
    		TriangularNumbers,
    		FibonacciNumbers,
    		scale,
    		cubicOut,
    		triangularNumbers,
    		Clipboard,
    		text,
    		selectedCipher,
    		selected,
    		triangularHighlight,
    		quickWord,
    		params,
    		showValues,
    		numberLookup,
    		numberSearch,
    		customNumberFilter,
    		numberInfo,
    		trivialList,
    		addToHighlights,
    		toggleAndUpdate,
    		displayCipher,
    		cycleBackward,
    		cycleForward,
    		valueOf,
    		evalWord,
    		simplify,
    		highlight,
    		triangleHighlight,
    		decode,
    		pasteText,
    		quickDecode,
    		specialNumbers,
    		currentCipher,
    		cipherString,
    		$triangularNumbers
    	});

    	$$self.$inject_state = $$props => {
    		if ('text' in $$props) $$invalidate(2, text = $$props.text);
    		if ('selectedCipher' in $$props) $$invalidate(0, selectedCipher = $$props.selectedCipher);
    		if ('selected' in $$props) selected = $$props.selected;
    		if ('triangularHighlight' in $$props) $$invalidate(3, triangularHighlight = $$props.triangularHighlight);
    		if ('quickWord' in $$props) $$invalidate(1, quickWord = $$props.quickWord);
    		if ('showValues' in $$props) showValues = $$props.showValues;
    		if ('numberLookup' in $$props) $$invalidate(5, numberLookup = $$props.numberLookup);
    		if ('numberSearch' in $$props) $$invalidate(6, numberSearch = $$props.numberSearch);
    		if ('customNumberFilter' in $$props) customNumberFilter = $$props.customNumberFilter;
    		if ('quickDecode' in $$props) $$invalidate(7, quickDecode = $$props.quickDecode);
    		if ('specialNumbers' in $$props) specialNumbers = $$props.specialNumbers;
    		if ('currentCipher' in $$props) $$invalidate(16, currentCipher = $$props.currentCipher);
    		if ('cipherString' in $$props) $$invalidate(8, cipherString = $$props.cipherString);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*selectedCipher*/ 1) {
    			$$invalidate(16, currentCipher = reducedCipherList[selectedCipher]);
    		}

    		if ($$self.$$.dirty[0] & /*currentCipher*/ 65536) {
    			$$invalidate(8, cipherString = () => {
    				if (!currentCipher) return "";
    				let letterValues = {};

    				for (const c of currentCipher.cArr) {
    					const letter = String.fromCharCode(c);
    					const val = currentCipher.vArr[currentCipher.cArr.indexOf(c)];
    					letterValues[letter] = val;
    				}

    				return JSON.stringify(letterValues);
    			});
    		}

    		if ($$self.$$.dirty[0] & /*selectedCipher, quickWord*/ 3) {
    			if (selectedCipher === selectedCipher) {
    				$$invalidate(7, quickDecode = evalWord(quickWord));
    			}
    		}

    		if ($$self.$$.dirty[0] & /*quickWord*/ 2) {
    			$$invalidate(7, quickDecode = evalWord(quickWord));
    		}
    	};

    	specialNumbers = [33, 38, 42, 47, 48, 74, 83, 84, 120, 137, 201];

    	return [
    		selectedCipher,
    		quickWord,
    		text,
    		triangularHighlight,
    		params,
    		numberLookup,
    		numberSearch,
    		quickDecode,
    		cipherString,
    		addToHighlights,
    		toggleAndUpdate,
    		displayCipher,
    		cycleBackward,
    		cycleForward,
    		decode,
    		pasteText,
    		currentCipher,
    		triangularnumbers_triangularHighlight_binding,
    		click_handler,
    		input0_input_handler,
    		input1_input_handler,
    		input2_input_handler,
    		click_handler_1,
    		click_handler_2,
    		click_handler_3,
    		click_handler_4,
    		select_change_handler,
    		shortcut_function,
    		input3_input_handler,
    		click_handler_5,
    		textinput_value_binding
    	];
    }

    class Decoder extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {}, null, [-1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Decoder",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.46.4 */
    const file = "src/App.svelte";

    function create_fragment(ctx) {
    	let nav;
    	let h5;
    	let t1;
    	let decoder;
    	let t2;
    	let main;
    	let current;
    	decoder = new Decoder({ $$inline: true });

    	const block = {
    		c: function create() {
    			nav = element("nav");
    			h5 = element("h5");
    			h5.textContent = "Gematria Decoder by Tony 201";
    			t1 = space();
    			create_component(decoder.$$.fragment);
    			t2 = space();
    			main = element("main");
    			attr_dev(h5, "class", "svelte-gwqc39");
    			add_location(h5, file, 14, 2, 457);
    			attr_dev(nav, "class", "svelte-gwqc39");
    			add_location(nav, file, 13, 2, 449);
    			attr_dev(main, "class", "svelte-gwqc39");
    			add_location(main, file, 21, 0, 525);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, nav, anchor);
    			append_dev(nav, h5);
    			append_dev(nav, t1);
    			mount_component(decoder, nav, null);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, main, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(decoder.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(decoder.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(nav);
    			destroy_component(decoder);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(main);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Decoder });
    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
      target: document.body,
      props: {},
    });

    return app;

})();

//# sourceMappingURL=bundle.js.map
