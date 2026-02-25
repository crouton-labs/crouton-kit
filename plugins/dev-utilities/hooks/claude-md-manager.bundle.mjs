#!/usr/bin/env node

// node_modules/@r-cli/sdk/sdk.mjs
import { join as az } from "path";
import { fileURLToPath as yI } from "url";
import { setMaxListeners as qK } from "events";
import { spawn as YV } from "child_process";
import { createInterface as WV } from "readline";
import * as h from "fs";
import { stat as mU, readdir as cU, unlink as pU, rmdir as dU, rm as iU, open as VP } from "fs/promises";
import { join as ZU } from "path";
import { homedir as CU } from "os";
import { dirname as K9, join as WW } from "path";
import { cwd as kU } from "process";
import { realpathSync as s7 } from "fs";
import { randomUUID as vU } from "crypto";
import { randomUUID as sU } from "crypto";
import { appendFileSync as eU, existsSync as XV, mkdirSync as QV } from "fs";
import { join as BW } from "path";
import { randomUUID as GV } from "crypto";
import { join as UW } from "path";
var BK = Object.create;
var { getPrototypeOf: zK, defineProperty: W9, getOwnPropertyNames: KK } = Object;
var UK = Object.prototype.hasOwnProperty;
var U7 = (X, Q, $) => {
  $ = X != null ? BK(zK(X)) : {};
  let Y = Q || !X || !X.__esModule ? W9($, "default", { value: X, enumerable: true }) : $;
  for (let W of KK(X)) if (!UK.call(Y, W)) W9(Y, W, { get: () => X[W], enumerable: true });
  return Y;
};
var P = (X, Q) => () => (Q || X((Q = { exports: {} }).exports, Q), Q.exports);
var V7 = (X, Q) => {
  for (var $ in Q) W9(X, $, { get: Q[$], enumerable: true, configurable: true, set: (Y) => Q[$] = () => Y });
};
var fX = P((GG) => {
  Object.defineProperty(GG, "__esModule", { value: true });
  GG.regexpCode = GG.getEsmExportName = GG.getProperty = GG.safeStringify = GG.stringify = GG.strConcat = GG.addCodeArg = GG.str = GG._ = GG.nil = GG._Code = GG.Name = GG.IDENTIFIER = GG._CodeOrName = void 0;
  class w8 {
  }
  GG._CodeOrName = w8;
  GG.IDENTIFIER = /^[a-z$_][a-z$_0-9]*$/i;
  class h6 extends w8 {
    constructor(X) {
      super();
      if (!GG.IDENTIFIER.test(X)) throw Error("CodeGen: name must be a valid identifier");
      this.str = X;
    }
    toString() {
      return this.str;
    }
    emptyStr() {
      return false;
    }
    get names() {
      return { [this.str]: 1 };
    }
  }
  GG.Name = h6;
  class s0 extends w8 {
    constructor(X) {
      super();
      this._items = typeof X === "string" ? [X] : X;
    }
    toString() {
      return this.str;
    }
    emptyStr() {
      if (this._items.length > 1) return false;
      let X = this._items[0];
      return X === "" || X === '""';
    }
    get str() {
      var X;
      return (X = this._str) !== null && X !== void 0 ? X : this._str = this._items.reduce((Q, $) => `${Q}${$}`, "");
    }
    get names() {
      var X;
      return (X = this._names) !== null && X !== void 0 ? X : this._names = this._items.reduce((Q, $) => {
        if ($ instanceof h6) Q[$.str] = (Q[$.str] || 0) + 1;
        return Q;
      }, {});
    }
  }
  GG._Code = s0;
  GG.nil = new s0("");
  function WG(X, ...Q) {
    let $ = [X[0]], Y = 0;
    while (Y < Q.length) e$($, Q[Y]), $.push(X[++Y]);
    return new s0($);
  }
  GG._ = WG;
  var s$ = new s0("+");
  function JG(X, ...Q) {
    let $ = [gX(X[0])], Y = 0;
    while (Y < Q.length) $.push(s$), e$($, Q[Y]), $.push(s$, gX(X[++Y]));
    return AN($), new s0($);
  }
  GG.str = JG;
  function e$(X, Q) {
    if (Q instanceof s0) X.push(...Q._items);
    else if (Q instanceof h6) X.push(Q);
    else X.push(RN(Q));
  }
  GG.addCodeArg = e$;
  function AN(X) {
    let Q = 1;
    while (Q < X.length - 1) {
      if (X[Q] === s$) {
        let $ = MN(X[Q - 1], X[Q + 1]);
        if ($ !== void 0) {
          X.splice(Q - 1, 3, $);
          continue;
        }
        X[Q++] = "+";
      }
      Q++;
    }
  }
  function MN(X, Q) {
    if (Q === '""') return X;
    if (X === '""') return Q;
    if (typeof X == "string") {
      if (Q instanceof h6 || X[X.length - 1] !== '"') return;
      if (typeof Q != "string") return `${X.slice(0, -1)}${Q}"`;
      if (Q[0] === '"') return X.slice(0, -1) + Q.slice(1);
      return;
    }
    if (typeof Q == "string" && Q[0] === '"' && !(X instanceof h6)) return `"${X}${Q.slice(1)}`;
    return;
  }
  function jN(X, Q) {
    return Q.emptyStr() ? X : X.emptyStr() ? Q : JG`${X}${Q}`;
  }
  GG.strConcat = jN;
  function RN(X) {
    return typeof X == "number" || typeof X == "boolean" || X === null ? X : gX(Array.isArray(X) ? X.join(",") : X);
  }
  function IN(X) {
    return new s0(gX(X));
  }
  GG.stringify = IN;
  function gX(X) {
    return JSON.stringify(X).replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
  }
  GG.safeStringify = gX;
  function EN(X) {
    return typeof X == "string" && GG.IDENTIFIER.test(X) ? new s0(`.${X}`) : WG`[${X}]`;
  }
  GG.getProperty = EN;
  function bN(X) {
    if (typeof X == "string" && GG.IDENTIFIER.test(X)) return new s0(`${X}`);
    throw Error(`CodeGen: invalid export name: ${X}, use explicit $id name mapping`);
  }
  GG.getEsmExportName = bN;
  function PN(X) {
    return new s0(X.toString());
  }
  GG.regexpCode = PN;
});
var YY = P((KG) => {
  Object.defineProperty(KG, "__esModule", { value: true });
  KG.ValueScope = KG.ValueScopeName = KG.Scope = KG.varKinds = KG.UsedValueState = void 0;
  var x0 = fX();
  class BG extends Error {
    constructor(X) {
      super(`CodeGen: "code" for ${X} not defined`);
      this.value = X.value;
    }
  }
  var M8;
  (function(X) {
    X[X.Started = 0] = "Started", X[X.Completed = 1] = "Completed";
  })(M8 || (KG.UsedValueState = M8 = {}));
  KG.varKinds = { const: new x0.Name("const"), let: new x0.Name("let"), var: new x0.Name("var") };
  class QY {
    constructor({ prefixes: X, parent: Q } = {}) {
      this._names = {}, this._prefixes = X, this._parent = Q;
    }
    toName(X) {
      return X instanceof x0.Name ? X : this.name(X);
    }
    name(X) {
      return new x0.Name(this._newName(X));
    }
    _newName(X) {
      let Q = this._names[X] || this._nameGroup(X);
      return `${X}${Q.index++}`;
    }
    _nameGroup(X) {
      var Q, $;
      if ((($ = (Q = this._parent) === null || Q === void 0 ? void 0 : Q._prefixes) === null || $ === void 0 ? void 0 : $.has(X)) || this._prefixes && !this._prefixes.has(X)) throw Error(`CodeGen: prefix "${X}" is not allowed in this scope`);
      return this._names[X] = { prefix: X, index: 0 };
    }
  }
  KG.Scope = QY;
  class $Y extends x0.Name {
    constructor(X, Q) {
      super(Q);
      this.prefix = X;
    }
    setValue(X, { property: Q, itemIndex: $ }) {
      this.value = X, this.scopePath = x0._`.${new x0.Name(Q)}[${$}]`;
    }
  }
  KG.ValueScopeName = $Y;
  var uN = x0._`\n`;
  class zG extends QY {
    constructor(X) {
      super(X);
      this._values = {}, this._scope = X.scope, this.opts = { ...X, _n: X.lines ? uN : x0.nil };
    }
    get() {
      return this._scope;
    }
    name(X) {
      return new $Y(X, this._newName(X));
    }
    value(X, Q) {
      var $;
      if (Q.ref === void 0) throw Error("CodeGen: ref must be passed in value");
      let Y = this.toName(X), { prefix: W } = Y, J = ($ = Q.key) !== null && $ !== void 0 ? $ : Q.ref, G = this._values[W];
      if (G) {
        let z = G.get(J);
        if (z) return z;
      } else G = this._values[W] = /* @__PURE__ */ new Map();
      G.set(J, Y);
      let H = this._scope[W] || (this._scope[W] = []), B = H.length;
      return H[B] = Q.ref, Y.setValue(Q, { property: W, itemIndex: B }), Y;
    }
    getValue(X, Q) {
      let $ = this._values[X];
      if (!$) return;
      return $.get(Q);
    }
    scopeRefs(X, Q = this._values) {
      return this._reduceValues(Q, ($) => {
        if ($.scopePath === void 0) throw Error(`CodeGen: name "${$}" has no value`);
        return x0._`${X}${$.scopePath}`;
      });
    }
    scopeCode(X = this._values, Q, $) {
      return this._reduceValues(X, (Y) => {
        if (Y.value === void 0) throw Error(`CodeGen: name "${Y}" has no value`);
        return Y.value.code;
      }, Q, $);
    }
    _reduceValues(X, Q, $ = {}, Y) {
      let W = x0.nil;
      for (let J in X) {
        let G = X[J];
        if (!G) continue;
        let H = $[J] = $[J] || /* @__PURE__ */ new Map();
        G.forEach((B) => {
          if (H.has(B)) return;
          H.set(B, M8.Started);
          let z = Q(B);
          if (z) {
            let K = this.opts.es5 ? KG.varKinds.var : KG.varKinds.const;
            W = x0._`${W}${K} ${B} = ${z};${this.opts._n}`;
          } else if (z = Y === null || Y === void 0 ? void 0 : Y(B)) W = x0._`${W}${z}${this.opts._n}`;
          else throw new BG(B);
          H.set(B, M8.Completed);
        });
      }
      return W;
    }
  }
  KG.ValueScope = zG;
});
var p = P((y0) => {
  Object.defineProperty(y0, "__esModule", { value: true });
  y0.or = y0.and = y0.not = y0.CodeGen = y0.operators = y0.varKinds = y0.ValueScopeName = y0.ValueScope = y0.Scope = y0.Name = y0.regexpCode = y0.stringify = y0.getProperty = y0.nil = y0.strConcat = y0.str = y0._ = void 0;
  var t = fX(), e0 = YY(), l1 = fX();
  Object.defineProperty(y0, "_", { enumerable: true, get: function() {
    return l1._;
  } });
  Object.defineProperty(y0, "str", { enumerable: true, get: function() {
    return l1.str;
  } });
  Object.defineProperty(y0, "strConcat", { enumerable: true, get: function() {
    return l1.strConcat;
  } });
  Object.defineProperty(y0, "nil", { enumerable: true, get: function() {
    return l1.nil;
  } });
  Object.defineProperty(y0, "getProperty", { enumerable: true, get: function() {
    return l1.getProperty;
  } });
  Object.defineProperty(y0, "stringify", { enumerable: true, get: function() {
    return l1.stringify;
  } });
  Object.defineProperty(y0, "regexpCode", { enumerable: true, get: function() {
    return l1.regexpCode;
  } });
  Object.defineProperty(y0, "Name", { enumerable: true, get: function() {
    return l1.Name;
  } });
  var P8 = YY();
  Object.defineProperty(y0, "Scope", { enumerable: true, get: function() {
    return P8.Scope;
  } });
  Object.defineProperty(y0, "ValueScope", { enumerable: true, get: function() {
    return P8.ValueScope;
  } });
  Object.defineProperty(y0, "ValueScopeName", { enumerable: true, get: function() {
    return P8.ValueScopeName;
  } });
  Object.defineProperty(y0, "varKinds", { enumerable: true, get: function() {
    return P8.varKinds;
  } });
  y0.operators = { GT: new t._Code(">"), GTE: new t._Code(">="), LT: new t._Code("<"), LTE: new t._Code("<="), EQ: new t._Code("==="), NEQ: new t._Code("!=="), NOT: new t._Code("!"), OR: new t._Code("||"), AND: new t._Code("&&"), ADD: new t._Code("+") };
  class m1 {
    optimizeNodes() {
      return this;
    }
    optimizeNames(X, Q) {
      return this;
    }
  }
  class VG extends m1 {
    constructor(X, Q, $) {
      super();
      this.varKind = X, this.name = Q, this.rhs = $;
    }
    render({ es5: X, _n: Q }) {
      let $ = X ? e0.varKinds.var : this.varKind, Y = this.rhs === void 0 ? "" : ` = ${this.rhs}`;
      return `${$} ${this.name}${Y};` + Q;
    }
    optimizeNames(X, Q) {
      if (!X[this.name.str]) return;
      if (this.rhs) this.rhs = l6(this.rhs, X, Q);
      return this;
    }
    get names() {
      return this.rhs instanceof t._CodeOrName ? this.rhs.names : {};
    }
  }
  class GY extends m1 {
    constructor(X, Q, $) {
      super();
      this.lhs = X, this.rhs = Q, this.sideEffects = $;
    }
    render({ _n: X }) {
      return `${this.lhs} = ${this.rhs};` + X;
    }
    optimizeNames(X, Q) {
      if (this.lhs instanceof t.Name && !X[this.lhs.str] && !this.sideEffects) return;
      return this.rhs = l6(this.rhs, X, Q), this;
    }
    get names() {
      let X = this.lhs instanceof t.Name ? {} : { ...this.lhs.names };
      return b8(X, this.rhs);
    }
  }
  class LG extends GY {
    constructor(X, Q, $, Y) {
      super(X, $, Y);
      this.op = Q;
    }
    render({ _n: X }) {
      return `${this.lhs} ${this.op}= ${this.rhs};` + X;
    }
  }
  class qG extends m1 {
    constructor(X) {
      super();
      this.label = X, this.names = {};
    }
    render({ _n: X }) {
      return `${this.label}:` + X;
    }
  }
  class FG extends m1 {
    constructor(X) {
      super();
      this.label = X, this.names = {};
    }
    render({ _n: X }) {
      return `break${this.label ? ` ${this.label}` : ""};` + X;
    }
  }
  class NG extends m1 {
    constructor(X) {
      super();
      this.error = X;
    }
    render({ _n: X }) {
      return `throw ${this.error};` + X;
    }
    get names() {
      return this.error.names;
    }
  }
  class OG extends m1 {
    constructor(X) {
      super();
      this.code = X;
    }
    render({ _n: X }) {
      return `${this.code};` + X;
    }
    optimizeNodes() {
      return `${this.code}` ? this : void 0;
    }
    optimizeNames(X, Q) {
      return this.code = l6(this.code, X, Q), this;
    }
    get names() {
      return this.code instanceof t._CodeOrName ? this.code.names : {};
    }
  }
  class S8 extends m1 {
    constructor(X = []) {
      super();
      this.nodes = X;
    }
    render(X) {
      return this.nodes.reduce((Q, $) => Q + $.render(X), "");
    }
    optimizeNodes() {
      let { nodes: X } = this, Q = X.length;
      while (Q--) {
        let $ = X[Q].optimizeNodes();
        if (Array.isArray($)) X.splice(Q, 1, ...$);
        else if ($) X[Q] = $;
        else X.splice(Q, 1);
      }
      return X.length > 0 ? this : void 0;
    }
    optimizeNames(X, Q) {
      let { nodes: $ } = this, Y = $.length;
      while (Y--) {
        let W = $[Y];
        if (W.optimizeNames(X, Q)) continue;
        pN(X, W.names), $.splice(Y, 1);
      }
      return $.length > 0 ? this : void 0;
    }
    get names() {
      return this.nodes.reduce((X, Q) => H6(X, Q.names), {});
    }
  }
  class c1 extends S8 {
    render(X) {
      return "{" + X._n + super.render(X) + "}" + X._n;
    }
  }
  class DG extends S8 {
  }
  class hX extends c1 {
  }
  hX.kind = "else";
  class j1 extends c1 {
    constructor(X, Q) {
      super(Q);
      this.condition = X;
    }
    render(X) {
      let Q = `if(${this.condition})` + super.render(X);
      if (this.else) Q += "else " + this.else.render(X);
      return Q;
    }
    optimizeNodes() {
      super.optimizeNodes();
      let X = this.condition;
      if (X === true) return this.nodes;
      let Q = this.else;
      if (Q) {
        let $ = Q.optimizeNodes();
        Q = this.else = Array.isArray($) ? new hX($) : $;
      }
      if (Q) {
        if (X === false) return Q instanceof j1 ? Q : Q.nodes;
        if (this.nodes.length) return this;
        return new j1(RG(X), Q instanceof j1 ? [Q] : Q.nodes);
      }
      if (X === false || !this.nodes.length) return;
      return this;
    }
    optimizeNames(X, Q) {
      var $;
      if (this.else = ($ = this.else) === null || $ === void 0 ? void 0 : $.optimizeNames(X, Q), !(super.optimizeNames(X, Q) || this.else)) return;
      return this.condition = l6(this.condition, X, Q), this;
    }
    get names() {
      let X = super.names;
      if (b8(X, this.condition), this.else) H6(X, this.else.names);
      return X;
    }
  }
  j1.kind = "if";
  class u6 extends c1 {
  }
  u6.kind = "for";
  class wG extends u6 {
    constructor(X) {
      super();
      this.iteration = X;
    }
    render(X) {
      return `for(${this.iteration})` + super.render(X);
    }
    optimizeNames(X, Q) {
      if (!super.optimizeNames(X, Q)) return;
      return this.iteration = l6(this.iteration, X, Q), this;
    }
    get names() {
      return H6(super.names, this.iteration.names);
    }
  }
  class AG extends u6 {
    constructor(X, Q, $, Y) {
      super();
      this.varKind = X, this.name = Q, this.from = $, this.to = Y;
    }
    render(X) {
      let Q = X.es5 ? e0.varKinds.var : this.varKind, { name: $, from: Y, to: W } = this;
      return `for(${Q} ${$}=${Y}; ${$}<${W}; ${$}++)` + super.render(X);
    }
    get names() {
      let X = b8(super.names, this.from);
      return b8(X, this.to);
    }
  }
  class WY extends u6 {
    constructor(X, Q, $, Y) {
      super();
      this.loop = X, this.varKind = Q, this.name = $, this.iterable = Y;
    }
    render(X) {
      return `for(${this.varKind} ${this.name} ${this.loop} ${this.iterable})` + super.render(X);
    }
    optimizeNames(X, Q) {
      if (!super.optimizeNames(X, Q)) return;
      return this.iterable = l6(this.iterable, X, Q), this;
    }
    get names() {
      return H6(super.names, this.iterable.names);
    }
  }
  class j8 extends c1 {
    constructor(X, Q, $) {
      super();
      this.name = X, this.args = Q, this.async = $;
    }
    render(X) {
      return `${this.async ? "async " : ""}function ${this.name}(${this.args})` + super.render(X);
    }
  }
  j8.kind = "func";
  class R8 extends S8 {
    render(X) {
      return "return " + super.render(X);
    }
  }
  R8.kind = "return";
  class MG extends c1 {
    render(X) {
      let Q = "try" + super.render(X);
      if (this.catch) Q += this.catch.render(X);
      if (this.finally) Q += this.finally.render(X);
      return Q;
    }
    optimizeNodes() {
      var X, Q;
      return super.optimizeNodes(), (X = this.catch) === null || X === void 0 || X.optimizeNodes(), (Q = this.finally) === null || Q === void 0 || Q.optimizeNodes(), this;
    }
    optimizeNames(X, Q) {
      var $, Y;
      return super.optimizeNames(X, Q), ($ = this.catch) === null || $ === void 0 || $.optimizeNames(X, Q), (Y = this.finally) === null || Y === void 0 || Y.optimizeNames(X, Q), this;
    }
    get names() {
      let X = super.names;
      if (this.catch) H6(X, this.catch.names);
      if (this.finally) H6(X, this.finally.names);
      return X;
    }
  }
  class I8 extends c1 {
    constructor(X) {
      super();
      this.error = X;
    }
    render(X) {
      return `catch(${this.error})` + super.render(X);
    }
  }
  I8.kind = "catch";
  class E8 extends c1 {
    render(X) {
      return "finally" + super.render(X);
    }
  }
  E8.kind = "finally";
  class jG {
    constructor(X, Q = {}) {
      this._values = {}, this._blockStarts = [], this._constants = {}, this.opts = { ...Q, _n: Q.lines ? `
` : "" }, this._extScope = X, this._scope = new e0.Scope({ parent: X }), this._nodes = [new DG()];
    }
    toString() {
      return this._root.render(this.opts);
    }
    name(X) {
      return this._scope.name(X);
    }
    scopeName(X) {
      return this._extScope.name(X);
    }
    scopeValue(X, Q) {
      let $ = this._extScope.value(X, Q);
      return (this._values[$.prefix] || (this._values[$.prefix] = /* @__PURE__ */ new Set())).add($), $;
    }
    getScopeValue(X, Q) {
      return this._extScope.getValue(X, Q);
    }
    scopeRefs(X) {
      return this._extScope.scopeRefs(X, this._values);
    }
    scopeCode() {
      return this._extScope.scopeCode(this._values);
    }
    _def(X, Q, $, Y) {
      let W = this._scope.toName(Q);
      if ($ !== void 0 && Y) this._constants[W.str] = $;
      return this._leafNode(new VG(X, W, $)), W;
    }
    const(X, Q, $) {
      return this._def(e0.varKinds.const, X, Q, $);
    }
    let(X, Q, $) {
      return this._def(e0.varKinds.let, X, Q, $);
    }
    var(X, Q, $) {
      return this._def(e0.varKinds.var, X, Q, $);
    }
    assign(X, Q, $) {
      return this._leafNode(new GY(X, Q, $));
    }
    add(X, Q) {
      return this._leafNode(new LG(X, y0.operators.ADD, Q));
    }
    code(X) {
      if (typeof X == "function") X();
      else if (X !== t.nil) this._leafNode(new OG(X));
      return this;
    }
    object(...X) {
      let Q = ["{"];
      for (let [$, Y] of X) {
        if (Q.length > 1) Q.push(",");
        if (Q.push($), $ !== Y || this.opts.es5) Q.push(":"), (0, t.addCodeArg)(Q, Y);
      }
      return Q.push("}"), new t._Code(Q);
    }
    if(X, Q, $) {
      if (this._blockNode(new j1(X)), Q && $) this.code(Q).else().code($).endIf();
      else if (Q) this.code(Q).endIf();
      else if ($) throw Error('CodeGen: "else" body without "then" body');
      return this;
    }
    elseIf(X) {
      return this._elseNode(new j1(X));
    }
    else() {
      return this._elseNode(new hX());
    }
    endIf() {
      return this._endBlockNode(j1, hX);
    }
    _for(X, Q) {
      if (this._blockNode(X), Q) this.code(Q).endFor();
      return this;
    }
    for(X, Q) {
      return this._for(new wG(X), Q);
    }
    forRange(X, Q, $, Y, W = this.opts.es5 ? e0.varKinds.var : e0.varKinds.let) {
      let J = this._scope.toName(X);
      return this._for(new AG(W, J, Q, $), () => Y(J));
    }
    forOf(X, Q, $, Y = e0.varKinds.const) {
      let W = this._scope.toName(X);
      if (this.opts.es5) {
        let J = Q instanceof t.Name ? Q : this.var("_arr", Q);
        return this.forRange("_i", 0, t._`${J}.length`, (G) => {
          this.var(W, t._`${J}[${G}]`), $(W);
        });
      }
      return this._for(new WY("of", Y, W, Q), () => $(W));
    }
    forIn(X, Q, $, Y = this.opts.es5 ? e0.varKinds.var : e0.varKinds.const) {
      if (this.opts.ownProperties) return this.forOf(X, t._`Object.keys(${Q})`, $);
      let W = this._scope.toName(X);
      return this._for(new WY("in", Y, W, Q), () => $(W));
    }
    endFor() {
      return this._endBlockNode(u6);
    }
    label(X) {
      return this._leafNode(new qG(X));
    }
    break(X) {
      return this._leafNode(new FG(X));
    }
    return(X) {
      let Q = new R8();
      if (this._blockNode(Q), this.code(X), Q.nodes.length !== 1) throw Error('CodeGen: "return" should have one node');
      return this._endBlockNode(R8);
    }
    try(X, Q, $) {
      if (!Q && !$) throw Error('CodeGen: "try" without "catch" and "finally"');
      let Y = new MG();
      if (this._blockNode(Y), this.code(X), Q) {
        let W = this.name("e");
        this._currNode = Y.catch = new I8(W), Q(W);
      }
      if ($) this._currNode = Y.finally = new E8(), this.code($);
      return this._endBlockNode(I8, E8);
    }
    throw(X) {
      return this._leafNode(new NG(X));
    }
    block(X, Q) {
      if (this._blockStarts.push(this._nodes.length), X) this.code(X).endBlock(Q);
      return this;
    }
    endBlock(X) {
      let Q = this._blockStarts.pop();
      if (Q === void 0) throw Error("CodeGen: not in self-balancing block");
      let $ = this._nodes.length - Q;
      if ($ < 0 || X !== void 0 && $ !== X) throw Error(`CodeGen: wrong number of nodes: ${$} vs ${X} expected`);
      return this._nodes.length = Q, this;
    }
    func(X, Q = t.nil, $, Y) {
      if (this._blockNode(new j8(X, Q, $)), Y) this.code(Y).endFunc();
      return this;
    }
    endFunc() {
      return this._endBlockNode(j8);
    }
    optimize(X = 1) {
      while (X-- > 0) this._root.optimizeNodes(), this._root.optimizeNames(this._root.names, this._constants);
    }
    _leafNode(X) {
      return this._currNode.nodes.push(X), this;
    }
    _blockNode(X) {
      this._currNode.nodes.push(X), this._nodes.push(X);
    }
    _endBlockNode(X, Q) {
      let $ = this._currNode;
      if ($ instanceof X || Q && $ instanceof Q) return this._nodes.pop(), this;
      throw Error(`CodeGen: not in block "${Q ? `${X.kind}/${Q.kind}` : X.kind}"`);
    }
    _elseNode(X) {
      let Q = this._currNode;
      if (!(Q instanceof j1)) throw Error('CodeGen: "else" without "if"');
      return this._currNode = Q.else = X, this;
    }
    get _root() {
      return this._nodes[0];
    }
    get _currNode() {
      let X = this._nodes;
      return X[X.length - 1];
    }
    set _currNode(X) {
      let Q = this._nodes;
      Q[Q.length - 1] = X;
    }
  }
  y0.CodeGen = jG;
  function H6(X, Q) {
    for (let $ in Q) X[$] = (X[$] || 0) + (Q[$] || 0);
    return X;
  }
  function b8(X, Q) {
    return Q instanceof t._CodeOrName ? H6(X, Q.names) : X;
  }
  function l6(X, Q, $) {
    if (X instanceof t.Name) return Y(X);
    if (!W(X)) return X;
    return new t._Code(X._items.reduce((J, G) => {
      if (G instanceof t.Name) G = Y(G);
      if (G instanceof t._Code) J.push(...G._items);
      else J.push(G);
      return J;
    }, []));
    function Y(J) {
      let G = $[J.str];
      if (G === void 0 || Q[J.str] !== 1) return J;
      return delete Q[J.str], G;
    }
    function W(J) {
      return J instanceof t._Code && J._items.some((G) => G instanceof t.Name && Q[G.str] === 1 && $[G.str] !== void 0);
    }
  }
  function pN(X, Q) {
    for (let $ in Q) X[$] = (X[$] || 0) - (Q[$] || 0);
  }
  function RG(X) {
    return typeof X == "boolean" || typeof X == "number" || X === null ? !X : t._`!${JY(X)}`;
  }
  y0.not = RG;
  var dN = IG(y0.operators.AND);
  function iN(...X) {
    return X.reduce(dN);
  }
  y0.and = iN;
  var nN = IG(y0.operators.OR);
  function rN(...X) {
    return X.reduce(nN);
  }
  y0.or = rN;
  function IG(X) {
    return (Q, $) => Q === t.nil ? $ : $ === t.nil ? Q : t._`${JY(Q)} ${X} ${JY($)}`;
  }
  function JY(X) {
    return X instanceof t.Name ? X : t._`(${X})`;
  }
});
var e = P((TG) => {
  Object.defineProperty(TG, "__esModule", { value: true });
  TG.checkStrictMode = TG.getErrorPath = TG.Type = TG.useFunc = TG.setEvaluated = TG.evaluatedPropsToName = TG.mergeEvaluated = TG.eachItem = TG.unescapeJsonPointer = TG.escapeJsonPointer = TG.escapeFragment = TG.unescapeFragment = TG.schemaRefOrVal = TG.schemaHasRulesButRef = TG.schemaHasRules = TG.checkUnknownRules = TG.alwaysValidSchema = TG.toHash = void 0;
  var $0 = p(), sN = fX();
  function eN(X) {
    let Q = {};
    for (let $ of X) Q[$] = true;
    return Q;
  }
  TG.toHash = eN;
  function XO(X, Q) {
    if (typeof Q == "boolean") return Q;
    if (Object.keys(Q).length === 0) return true;
    return SG(X, Q), !ZG(Q, X.self.RULES.all);
  }
  TG.alwaysValidSchema = XO;
  function SG(X, Q = X.schema) {
    let { opts: $, self: Y } = X;
    if (!$.strictSchema) return;
    if (typeof Q === "boolean") return;
    let W = Y.RULES.keywords;
    for (let J in Q) if (!W[J]) vG(X, `unknown keyword: "${J}"`);
  }
  TG.checkUnknownRules = SG;
  function ZG(X, Q) {
    if (typeof X == "boolean") return !X;
    for (let $ in X) if (Q[$]) return true;
    return false;
  }
  TG.schemaHasRules = ZG;
  function QO(X, Q) {
    if (typeof X == "boolean") return !X;
    for (let $ in X) if ($ !== "$ref" && Q.all[$]) return true;
    return false;
  }
  TG.schemaHasRulesButRef = QO;
  function $O({ topSchemaRef: X, schemaPath: Q }, $, Y, W) {
    if (!W) {
      if (typeof $ == "number" || typeof $ == "boolean") return $;
      if (typeof $ == "string") return $0._`${$}`;
    }
    return $0._`${X}${Q}${(0, $0.getProperty)(Y)}`;
  }
  TG.schemaRefOrVal = $O;
  function YO(X) {
    return CG(decodeURIComponent(X));
  }
  TG.unescapeFragment = YO;
  function WO(X) {
    return encodeURIComponent(BY(X));
  }
  TG.escapeFragment = WO;
  function BY(X) {
    if (typeof X == "number") return `${X}`;
    return X.replace(/~/g, "~0").replace(/\//g, "~1");
  }
  TG.escapeJsonPointer = BY;
  function CG(X) {
    return X.replace(/~1/g, "/").replace(/~0/g, "~");
  }
  TG.unescapeJsonPointer = CG;
  function JO(X, Q) {
    if (Array.isArray(X)) for (let $ of X) Q($);
    else Q(X);
  }
  TG.eachItem = JO;
  function bG({ mergeNames: X, mergeToName: Q, mergeValues: $, resultToName: Y }) {
    return (W, J, G, H) => {
      let B = G === void 0 ? J : G instanceof $0.Name ? (J instanceof $0.Name ? X(W, J, G) : Q(W, J, G), G) : J instanceof $0.Name ? (Q(W, G, J), J) : $(J, G);
      return H === $0.Name && !(B instanceof $0.Name) ? Y(W, B) : B;
    };
  }
  TG.mergeEvaluated = { props: bG({ mergeNames: (X, Q, $) => X.if($0._`${$} !== true && ${Q} !== undefined`, () => {
    X.if($0._`${Q} === true`, () => X.assign($, true), () => X.assign($, $0._`${$} || {}`).code($0._`Object.assign(${$}, ${Q})`));
  }), mergeToName: (X, Q, $) => X.if($0._`${$} !== true`, () => {
    if (Q === true) X.assign($, true);
    else X.assign($, $0._`${$} || {}`), zY(X, $, Q);
  }), mergeValues: (X, Q) => X === true ? true : { ...X, ...Q }, resultToName: kG }), items: bG({ mergeNames: (X, Q, $) => X.if($0._`${$} !== true && ${Q} !== undefined`, () => X.assign($, $0._`${Q} === true ? true : ${$} > ${Q} ? ${$} : ${Q}`)), mergeToName: (X, Q, $) => X.if($0._`${$} !== true`, () => X.assign($, Q === true ? true : $0._`${$} > ${Q} ? ${$} : ${Q}`)), mergeValues: (X, Q) => X === true ? true : Math.max(X, Q), resultToName: (X, Q) => X.var("items", Q) }) };
  function kG(X, Q) {
    if (Q === true) return X.var("props", true);
    let $ = X.var("props", $0._`{}`);
    if (Q !== void 0) zY(X, $, Q);
    return $;
  }
  TG.evaluatedPropsToName = kG;
  function zY(X, Q, $) {
    Object.keys($).forEach((Y) => X.assign($0._`${Q}${(0, $0.getProperty)(Y)}`, true));
  }
  TG.setEvaluated = zY;
  var PG = {};
  function GO(X, Q) {
    return X.scopeValue("func", { ref: Q, code: PG[Q.code] || (PG[Q.code] = new sN._Code(Q.code)) });
  }
  TG.useFunc = GO;
  var HY;
  (function(X) {
    X[X.Num = 0] = "Num", X[X.Str = 1] = "Str";
  })(HY || (TG.Type = HY = {}));
  function HO(X, Q, $) {
    if (X instanceof $0.Name) {
      let Y = Q === HY.Num;
      return $ ? Y ? $0._`"[" + ${X} + "]"` : $0._`"['" + ${X} + "']"` : Y ? $0._`"/" + ${X}` : $0._`"/" + ${X}.replace(/~/g, "~0").replace(/\\//g, "~1")`;
    }
    return $ ? (0, $0.getProperty)(X).toString() : "/" + BY(X);
  }
  TG.getErrorPath = HO;
  function vG(X, Q, $ = X.opts.strictSchema) {
    if (!$) return;
    if (Q = `strict mode: ${Q}`, $ === true) throw Error(Q);
    X.self.logger.warn(Q);
  }
  TG.checkStrictMode = vG;
});
var R1 = P((xG) => {
  Object.defineProperty(xG, "__esModule", { value: true });
  var S0 = p(), EO = { data: new S0.Name("data"), valCxt: new S0.Name("valCxt"), instancePath: new S0.Name("instancePath"), parentData: new S0.Name("parentData"), parentDataProperty: new S0.Name("parentDataProperty"), rootData: new S0.Name("rootData"), dynamicAnchors: new S0.Name("dynamicAnchors"), vErrors: new S0.Name("vErrors"), errors: new S0.Name("errors"), this: new S0.Name("this"), self: new S0.Name("self"), scope: new S0.Name("scope"), json: new S0.Name("json"), jsonPos: new S0.Name("jsonPos"), jsonLen: new S0.Name("jsonLen"), jsonPart: new S0.Name("jsonPart") };
  xG.default = EO;
});
var uX = P((hG) => {
  Object.defineProperty(hG, "__esModule", { value: true });
  hG.extendErrors = hG.resetErrorsCount = hG.reportExtraError = hG.reportError = hG.keyword$DataError = hG.keywordError = void 0;
  var a = p(), C8 = e(), v0 = R1();
  hG.keywordError = { message: ({ keyword: X }) => a.str`must pass "${X}" keyword validation` };
  hG.keyword$DataError = { message: ({ keyword: X, schemaType: Q }) => Q ? a.str`"${X}" keyword must be ${Q} ($data)` : a.str`"${X}" keyword is invalid ($data)` };
  function PO(X, Q = hG.keywordError, $, Y) {
    let { it: W } = X, { gen: J, compositeRule: G, allErrors: H } = W, B = fG(X, Q, $);
    if (Y !== null && Y !== void 0 ? Y : G || H) yG(J, B);
    else gG(W, a._`[${B}]`);
  }
  hG.reportError = PO;
  function SO(X, Q = hG.keywordError, $) {
    let { it: Y } = X, { gen: W, compositeRule: J, allErrors: G } = Y, H = fG(X, Q, $);
    if (yG(W, H), !(J || G)) gG(Y, v0.default.vErrors);
  }
  hG.reportExtraError = SO;
  function ZO(X, Q) {
    X.assign(v0.default.errors, Q), X.if(a._`${v0.default.vErrors} !== null`, () => X.if(Q, () => X.assign(a._`${v0.default.vErrors}.length`, Q), () => X.assign(v0.default.vErrors, null)));
  }
  hG.resetErrorsCount = ZO;
  function CO({ gen: X, keyword: Q, schemaValue: $, data: Y, errsCount: W, it: J }) {
    if (W === void 0) throw Error("ajv implementation error");
    let G = X.name("err");
    X.forRange("i", W, v0.default.errors, (H) => {
      if (X.const(G, a._`${v0.default.vErrors}[${H}]`), X.if(a._`${G}.instancePath === undefined`, () => X.assign(a._`${G}.instancePath`, (0, a.strConcat)(v0.default.instancePath, J.errorPath))), X.assign(a._`${G}.schemaPath`, a.str`${J.errSchemaPath}/${Q}`), J.opts.verbose) X.assign(a._`${G}.schema`, $), X.assign(a._`${G}.data`, Y);
    });
  }
  hG.extendErrors = CO;
  function yG(X, Q) {
    let $ = X.const("err", Q);
    X.if(a._`${v0.default.vErrors} === null`, () => X.assign(v0.default.vErrors, a._`[${$}]`), a._`${v0.default.vErrors}.push(${$})`), X.code(a._`${v0.default.errors}++`);
  }
  function gG(X, Q) {
    let { gen: $, validateName: Y, schemaEnv: W } = X;
    if (W.$async) $.throw(a._`new ${X.ValidationError}(${Q})`);
    else $.assign(a._`${Y}.errors`, Q), $.return(false);
  }
  var B6 = { keyword: new a.Name("keyword"), schemaPath: new a.Name("schemaPath"), params: new a.Name("params"), propertyName: new a.Name("propertyName"), message: new a.Name("message"), schema: new a.Name("schema"), parentSchema: new a.Name("parentSchema") };
  function fG(X, Q, $) {
    let { createErrors: Y } = X.it;
    if (Y === false) return a._`{}`;
    return kO(X, Q, $);
  }
  function kO(X, Q, $ = {}) {
    let { gen: Y, it: W } = X, J = [vO(W, $), TO(X, $)];
    return _O(X, Q, J), Y.object(...J);
  }
  function vO({ errorPath: X }, { instancePath: Q }) {
    let $ = Q ? a.str`${X}${(0, C8.getErrorPath)(Q, C8.Type.Str)}` : X;
    return [v0.default.instancePath, (0, a.strConcat)(v0.default.instancePath, $)];
  }
  function TO({ keyword: X, it: { errSchemaPath: Q } }, { schemaPath: $, parentSchema: Y }) {
    let W = Y ? Q : a.str`${Q}/${X}`;
    if ($) W = a.str`${W}${(0, C8.getErrorPath)($, C8.Type.Str)}`;
    return [B6.schemaPath, W];
  }
  function _O(X, { params: Q, message: $ }, Y) {
    let { keyword: W, data: J, schemaValue: G, it: H } = X, { opts: B, propertyName: z, topSchemaRef: K, schemaPath: V } = H;
    if (Y.push([B6.keyword, W], [B6.params, typeof Q == "function" ? Q(X) : Q || a._`{}`]), B.messages) Y.push([B6.message, typeof $ == "function" ? $(X) : $]);
    if (B.verbose) Y.push([B6.schema, G], [B6.parentSchema, a._`${K}${V}`], [v0.default.data, J]);
    if (z) Y.push([B6.propertyName, z]);
  }
});
var pG = P((mG) => {
  Object.defineProperty(mG, "__esModule", { value: true });
  mG.boolOrEmptySchema = mG.topBoolOrEmptySchema = void 0;
  var hO = uX(), uO = p(), lO = R1(), mO = { message: "boolean schema is false" };
  function cO(X) {
    let { gen: Q, schema: $, validateName: Y } = X;
    if ($ === false) lG(X, false);
    else if (typeof $ == "object" && $.$async === true) Q.return(lO.default.data);
    else Q.assign(uO._`${Y}.errors`, null), Q.return(true);
  }
  mG.topBoolOrEmptySchema = cO;
  function pO(X, Q) {
    let { gen: $, schema: Y } = X;
    if (Y === false) $.var(Q, false), lG(X);
    else $.var(Q, true);
  }
  mG.boolOrEmptySchema = pO;
  function lG(X, Q) {
    let { gen: $, data: Y } = X, W = { gen: $, keyword: "false schema", data: Y, schema: false, schemaCode: false, schemaValue: false, params: {}, it: X };
    (0, hO.reportError)(W, mO, void 0, Q);
  }
});
var UY = P((dG) => {
  Object.defineProperty(dG, "__esModule", { value: true });
  dG.getRules = dG.isJSONType = void 0;
  var iO = ["string", "number", "integer", "boolean", "null", "object", "array"], nO = new Set(iO);
  function rO(X) {
    return typeof X == "string" && nO.has(X);
  }
  dG.isJSONType = rO;
  function oO() {
    let X = { number: { type: "number", rules: [] }, string: { type: "string", rules: [] }, array: { type: "array", rules: [] }, object: { type: "object", rules: [] } };
    return { types: { ...X, integer: true, boolean: true, null: true }, rules: [{ rules: [] }, X.number, X.string, X.array, X.object], post: { rules: [] }, all: {}, keywords: {} };
  }
  dG.getRules = oO;
});
var VY = P((oG) => {
  Object.defineProperty(oG, "__esModule", { value: true });
  oG.shouldUseRule = oG.shouldUseGroup = oG.schemaHasRulesForType = void 0;
  function aO({ schema: X, self: Q }, $) {
    let Y = Q.RULES.types[$];
    return Y && Y !== true && nG(X, Y);
  }
  oG.schemaHasRulesForType = aO;
  function nG(X, Q) {
    return Q.rules.some(($) => rG(X, $));
  }
  oG.shouldUseGroup = nG;
  function rG(X, Q) {
    var $;
    return X[Q.keyword] !== void 0 || (($ = Q.definition.implements) === null || $ === void 0 ? void 0 : $.some((Y) => X[Y] !== void 0));
  }
  oG.shouldUseRule = rG;
});
var lX = P((X3) => {
  Object.defineProperty(X3, "__esModule", { value: true });
  X3.reportTypeError = X3.checkDataTypes = X3.checkDataType = X3.coerceAndCheckDataType = X3.getJSONTypes = X3.getSchemaTypes = X3.DataType = void 0;
  var XD = UY(), QD = VY(), $D = uX(), c = p(), aG = e(), m6;
  (function(X) {
    X[X.Correct = 0] = "Correct", X[X.Wrong = 1] = "Wrong";
  })(m6 || (X3.DataType = m6 = {}));
  function YD(X) {
    let Q = sG(X.type);
    if (Q.includes("null")) {
      if (X.nullable === false) throw Error("type: null contradicts nullable: false");
    } else {
      if (!Q.length && X.nullable !== void 0) throw Error('"nullable" cannot be used without "type"');
      if (X.nullable === true) Q.push("null");
    }
    return Q;
  }
  X3.getSchemaTypes = YD;
  function sG(X) {
    let Q = Array.isArray(X) ? X : X ? [X] : [];
    if (Q.every(XD.isJSONType)) return Q;
    throw Error("type must be JSONType or JSONType[]: " + Q.join(","));
  }
  X3.getJSONTypes = sG;
  function WD(X, Q) {
    let { gen: $, data: Y, opts: W } = X, J = JD(Q, W.coerceTypes), G = Q.length > 0 && !(J.length === 0 && Q.length === 1 && (0, QD.schemaHasRulesForType)(X, Q[0]));
    if (G) {
      let H = qY(Q, Y, W.strictNumbers, m6.Wrong);
      $.if(H, () => {
        if (J.length) GD(X, Q, J);
        else FY(X);
      });
    }
    return G;
  }
  X3.coerceAndCheckDataType = WD;
  var eG = /* @__PURE__ */ new Set(["string", "number", "integer", "boolean", "null"]);
  function JD(X, Q) {
    return Q ? X.filter(($) => eG.has($) || Q === "array" && $ === "array") : [];
  }
  function GD(X, Q, $) {
    let { gen: Y, data: W, opts: J } = X, G = Y.let("dataType", c._`typeof ${W}`), H = Y.let("coerced", c._`undefined`);
    if (J.coerceTypes === "array") Y.if(c._`${G} == 'object' && Array.isArray(${W}) && ${W}.length == 1`, () => Y.assign(W, c._`${W}[0]`).assign(G, c._`typeof ${W}`).if(qY(Q, W, J.strictNumbers), () => Y.assign(H, W)));
    Y.if(c._`${H} !== undefined`);
    for (let z of $) if (eG.has(z) || z === "array" && J.coerceTypes === "array") B(z);
    Y.else(), FY(X), Y.endIf(), Y.if(c._`${H} !== undefined`, () => {
      Y.assign(W, H), HD(X, H);
    });
    function B(z) {
      switch (z) {
        case "string":
          Y.elseIf(c._`${G} == "number" || ${G} == "boolean"`).assign(H, c._`"" + ${W}`).elseIf(c._`${W} === null`).assign(H, c._`""`);
          return;
        case "number":
          Y.elseIf(c._`${G} == "boolean" || ${W} === null
              || (${G} == "string" && ${W} && ${W} == +${W})`).assign(H, c._`+${W}`);
          return;
        case "integer":
          Y.elseIf(c._`${G} === "boolean" || ${W} === null
              || (${G} === "string" && ${W} && ${W} == +${W} && !(${W} % 1))`).assign(H, c._`+${W}`);
          return;
        case "boolean":
          Y.elseIf(c._`${W} === "false" || ${W} === 0 || ${W} === null`).assign(H, false).elseIf(c._`${W} === "true" || ${W} === 1`).assign(H, true);
          return;
        case "null":
          Y.elseIf(c._`${W} === "" || ${W} === 0 || ${W} === false`), Y.assign(H, null);
          return;
        case "array":
          Y.elseIf(c._`${G} === "string" || ${G} === "number"
              || ${G} === "boolean" || ${W} === null`).assign(H, c._`[${W}]`);
      }
    }
  }
  function HD({ gen: X, parentData: Q, parentDataProperty: $ }, Y) {
    X.if(c._`${Q} !== undefined`, () => X.assign(c._`${Q}[${$}]`, Y));
  }
  function LY(X, Q, $, Y = m6.Correct) {
    let W = Y === m6.Correct ? c.operators.EQ : c.operators.NEQ, J;
    switch (X) {
      case "null":
        return c._`${Q} ${W} null`;
      case "array":
        J = c._`Array.isArray(${Q})`;
        break;
      case "object":
        J = c._`${Q} && typeof ${Q} == "object" && !Array.isArray(${Q})`;
        break;
      case "integer":
        J = G(c._`!(${Q} % 1) && !isNaN(${Q})`);
        break;
      case "number":
        J = G();
        break;
      default:
        return c._`typeof ${Q} ${W} ${X}`;
    }
    return Y === m6.Correct ? J : (0, c.not)(J);
    function G(H = c.nil) {
      return (0, c.and)(c._`typeof ${Q} == "number"`, H, $ ? c._`isFinite(${Q})` : c.nil);
    }
  }
  X3.checkDataType = LY;
  function qY(X, Q, $, Y) {
    if (X.length === 1) return LY(X[0], Q, $, Y);
    let W, J = (0, aG.toHash)(X);
    if (J.array && J.object) {
      let G = c._`typeof ${Q} != "object"`;
      W = J.null ? G : c._`!${Q} || ${G}`, delete J.null, delete J.array, delete J.object;
    } else W = c.nil;
    if (J.number) delete J.integer;
    for (let G in J) W = (0, c.and)(W, LY(G, Q, $, Y));
    return W;
  }
  X3.checkDataTypes = qY;
  var BD = { message: ({ schema: X }) => `must be ${X}`, params: ({ schema: X, schemaValue: Q }) => typeof X == "string" ? c._`{type: ${X}}` : c._`{type: ${Q}}` };
  function FY(X) {
    let Q = zD(X);
    (0, $D.reportError)(Q, BD);
  }
  X3.reportTypeError = FY;
  function zD(X) {
    let { gen: Q, data: $, schema: Y } = X, W = (0, aG.schemaRefOrVal)(X, Y, "type");
    return { gen: Q, keyword: "type", data: $, schema: Y.type, schemaCode: W, schemaValue: W, parentSchema: Y, params: {}, it: X };
  }
});
var J3 = P((Y3) => {
  Object.defineProperty(Y3, "__esModule", { value: true });
  Y3.assignDefaults = void 0;
  var c6 = p(), ND = e();
  function OD(X, Q) {
    let { properties: $, items: Y } = X.schema;
    if (Q === "object" && $) for (let W in $) $3(X, W, $[W].default);
    else if (Q === "array" && Array.isArray(Y)) Y.forEach((W, J) => $3(X, J, W.default));
  }
  Y3.assignDefaults = OD;
  function $3(X, Q, $) {
    let { gen: Y, compositeRule: W, data: J, opts: G } = X;
    if ($ === void 0) return;
    let H = c6._`${J}${(0, c6.getProperty)(Q)}`;
    if (W) {
      (0, ND.checkStrictMode)(X, `default is ignored for: ${H}`);
      return;
    }
    let B = c6._`${H} === undefined`;
    if (G.useDefaults === "empty") B = c6._`${B} || ${H} === null || ${H} === ""`;
    Y.if(B, c6._`${H} = ${(0, c6.stringify)($)}`);
  }
});
var d0 = P((B3) => {
  Object.defineProperty(B3, "__esModule", { value: true });
  B3.validateUnion = B3.validateArray = B3.usePattern = B3.callValidateCode = B3.schemaProperties = B3.allSchemaProperties = B3.noPropertyInData = B3.propertyInData = B3.isOwnProperty = B3.hasPropFunc = B3.reportMissingProp = B3.checkMissingProp = B3.checkReportMissingProp = void 0;
  var G0 = p(), NY = e(), p1 = R1(), DD = e();
  function wD(X, Q) {
    let { gen: $, data: Y, it: W } = X;
    $.if(DY($, Y, Q, W.opts.ownProperties), () => {
      X.setParams({ missingProperty: G0._`${Q}` }, true), X.error();
    });
  }
  B3.checkReportMissingProp = wD;
  function AD({ gen: X, data: Q, it: { opts: $ } }, Y, W) {
    return (0, G0.or)(...Y.map((J) => (0, G0.and)(DY(X, Q, J, $.ownProperties), G0._`${W} = ${J}`)));
  }
  B3.checkMissingProp = AD;
  function MD(X, Q) {
    X.setParams({ missingProperty: Q }, true), X.error();
  }
  B3.reportMissingProp = MD;
  function G3(X) {
    return X.scopeValue("func", { ref: Object.prototype.hasOwnProperty, code: G0._`Object.prototype.hasOwnProperty` });
  }
  B3.hasPropFunc = G3;
  function OY(X, Q, $) {
    return G0._`${G3(X)}.call(${Q}, ${$})`;
  }
  B3.isOwnProperty = OY;
  function jD(X, Q, $, Y) {
    let W = G0._`${Q}${(0, G0.getProperty)($)} !== undefined`;
    return Y ? G0._`${W} && ${OY(X, Q, $)}` : W;
  }
  B3.propertyInData = jD;
  function DY(X, Q, $, Y) {
    let W = G0._`${Q}${(0, G0.getProperty)($)} === undefined`;
    return Y ? (0, G0.or)(W, (0, G0.not)(OY(X, Q, $))) : W;
  }
  B3.noPropertyInData = DY;
  function H3(X) {
    return X ? Object.keys(X).filter((Q) => Q !== "__proto__") : [];
  }
  B3.allSchemaProperties = H3;
  function RD(X, Q) {
    return H3(Q).filter(($) => !(0, NY.alwaysValidSchema)(X, Q[$]));
  }
  B3.schemaProperties = RD;
  function ID({ schemaCode: X, data: Q, it: { gen: $, topSchemaRef: Y, schemaPath: W, errorPath: J }, it: G }, H, B, z) {
    let K = z ? G0._`${X}, ${Q}, ${Y}${W}` : Q, V = [[p1.default.instancePath, (0, G0.strConcat)(p1.default.instancePath, J)], [p1.default.parentData, G.parentData], [p1.default.parentDataProperty, G.parentDataProperty], [p1.default.rootData, p1.default.rootData]];
    if (G.opts.dynamicRef) V.push([p1.default.dynamicAnchors, p1.default.dynamicAnchors]);
    let L = G0._`${K}, ${$.object(...V)}`;
    return B !== G0.nil ? G0._`${H}.call(${B}, ${L})` : G0._`${H}(${L})`;
  }
  B3.callValidateCode = ID;
  var ED = G0._`new RegExp`;
  function bD({ gen: X, it: { opts: Q } }, $) {
    let Y = Q.unicodeRegExp ? "u" : "", { regExp: W } = Q.code, J = W($, Y);
    return X.scopeValue("pattern", { key: J.toString(), ref: J, code: G0._`${W.code === "new RegExp" ? ED : (0, DD.useFunc)(X, W)}(${$}, ${Y})` });
  }
  B3.usePattern = bD;
  function PD(X) {
    let { gen: Q, data: $, keyword: Y, it: W } = X, J = Q.name("valid");
    if (W.allErrors) {
      let H = Q.let("valid", true);
      return G(() => Q.assign(H, false)), H;
    }
    return Q.var(J, true), G(() => Q.break()), J;
    function G(H) {
      let B = Q.const("len", G0._`${$}.length`);
      Q.forRange("i", 0, B, (z) => {
        X.subschema({ keyword: Y, dataProp: z, dataPropType: NY.Type.Num }, J), Q.if((0, G0.not)(J), H);
      });
    }
  }
  B3.validateArray = PD;
  function SD(X) {
    let { gen: Q, schema: $, keyword: Y, it: W } = X;
    if (!Array.isArray($)) throw Error("ajv implementation error");
    if ($.some((B) => (0, NY.alwaysValidSchema)(W, B)) && !W.opts.unevaluated) return;
    let G = Q.let("valid", false), H = Q.name("_valid");
    Q.block(() => $.forEach((B, z) => {
      let K = X.subschema({ keyword: Y, schemaProp: z, compositeRule: true }, H);
      if (Q.assign(G, G0._`${G} || ${H}`), !X.mergeValidEvaluated(K, H)) Q.if((0, G0.not)(G));
    })), X.result(G, () => X.reset(), () => X.error(true));
  }
  B3.validateUnion = SD;
});
var q3 = P((V3) => {
  Object.defineProperty(V3, "__esModule", { value: true });
  V3.validateKeywordUsage = V3.validSchemaType = V3.funcKeywordCode = V3.macroKeywordCode = void 0;
  var T0 = p(), z6 = R1(), lD = d0(), mD = uX();
  function cD(X, Q) {
    let { gen: $, keyword: Y, schema: W, parentSchema: J, it: G } = X, H = Q.macro.call(G.self, W, J, G), B = U3($, Y, H);
    if (G.opts.validateSchema !== false) G.self.validateSchema(H, true);
    let z = $.name("valid");
    X.subschema({ schema: H, schemaPath: T0.nil, errSchemaPath: `${G.errSchemaPath}/${Y}`, topSchemaRef: B, compositeRule: true }, z), X.pass(z, () => X.error(true));
  }
  V3.macroKeywordCode = cD;
  function pD(X, Q) {
    var $;
    let { gen: Y, keyword: W, schema: J, parentSchema: G, $data: H, it: B } = X;
    iD(B, Q);
    let z = !H && Q.compile ? Q.compile.call(B.self, J, G, B) : Q.validate, K = U3(Y, W, z), V = Y.let("valid");
    X.block$data(V, L), X.ok(($ = Q.valid) !== null && $ !== void 0 ? $ : V);
    function L() {
      if (Q.errors === false) {
        if (q(), Q.modifying) K3(X);
        N(() => X.error());
      } else {
        let w = Q.async ? U() : F();
        if (Q.modifying) K3(X);
        N(() => dD(X, w));
      }
    }
    function U() {
      let w = Y.let("ruleErrs", null);
      return Y.try(() => q(T0._`await `), (M) => Y.assign(V, false).if(T0._`${M} instanceof ${B.ValidationError}`, () => Y.assign(w, T0._`${M}.errors`), () => Y.throw(M))), w;
    }
    function F() {
      let w = T0._`${K}.errors`;
      return Y.assign(w, null), q(T0.nil), w;
    }
    function q(w = Q.async ? T0._`await ` : T0.nil) {
      let M = B.opts.passContext ? z6.default.this : z6.default.self, R = !("compile" in Q && !H || Q.schema === false);
      Y.assign(V, T0._`${w}${(0, lD.callValidateCode)(X, K, M, R)}`, Q.modifying);
    }
    function N(w) {
      var M;
      Y.if((0, T0.not)((M = Q.valid) !== null && M !== void 0 ? M : V), w);
    }
  }
  V3.funcKeywordCode = pD;
  function K3(X) {
    let { gen: Q, data: $, it: Y } = X;
    Q.if(Y.parentData, () => Q.assign($, T0._`${Y.parentData}[${Y.parentDataProperty}]`));
  }
  function dD(X, Q) {
    let { gen: $ } = X;
    $.if(T0._`Array.isArray(${Q})`, () => {
      $.assign(z6.default.vErrors, T0._`${z6.default.vErrors} === null ? ${Q} : ${z6.default.vErrors}.concat(${Q})`).assign(z6.default.errors, T0._`${z6.default.vErrors}.length`), (0, mD.extendErrors)(X);
    }, () => X.error());
  }
  function iD({ schemaEnv: X }, Q) {
    if (Q.async && !X.$async) throw Error("async keyword in sync schema");
  }
  function U3(X, Q, $) {
    if ($ === void 0) throw Error(`keyword "${Q}" failed to compile`);
    return X.scopeValue("keyword", typeof $ == "function" ? { ref: $ } : { ref: $, code: (0, T0.stringify)($) });
  }
  function nD(X, Q, $ = false) {
    return !Q.length || Q.some((Y) => Y === "array" ? Array.isArray(X) : Y === "object" ? X && typeof X == "object" && !Array.isArray(X) : typeof X == Y || $ && typeof X > "u");
  }
  V3.validSchemaType = nD;
  function rD({ schema: X, opts: Q, self: $, errSchemaPath: Y }, W, J) {
    if (Array.isArray(W.keyword) ? !W.keyword.includes(J) : W.keyword !== J) throw Error("ajv implementation error");
    let G = W.dependencies;
    if (G === null || G === void 0 ? void 0 : G.some((H) => !Object.prototype.hasOwnProperty.call(X, H))) throw Error(`parent schema must have dependencies of ${J}: ${G.join(",")}`);
    if (W.validateSchema) {
      if (!W.validateSchema(X[J])) {
        let B = `keyword "${J}" value is invalid at path "${Y}": ` + $.errorsText(W.validateSchema.errors);
        if (Q.validateSchema === "log") $.logger.error(B);
        else throw Error(B);
      }
    }
  }
  V3.validateKeywordUsage = rD;
});
var D3 = P((N3) => {
  Object.defineProperty(N3, "__esModule", { value: true });
  N3.extendSubschemaMode = N3.extendSubschemaData = N3.getSubschema = void 0;
  var K1 = p(), F3 = e();
  function sD(X, { keyword: Q, schemaProp: $, schema: Y, schemaPath: W, errSchemaPath: J, topSchemaRef: G }) {
    if (Q !== void 0 && Y !== void 0) throw Error('both "keyword" and "schema" passed, only one allowed');
    if (Q !== void 0) {
      let H = X.schema[Q];
      return $ === void 0 ? { schema: H, schemaPath: K1._`${X.schemaPath}${(0, K1.getProperty)(Q)}`, errSchemaPath: `${X.errSchemaPath}/${Q}` } : { schema: H[$], schemaPath: K1._`${X.schemaPath}${(0, K1.getProperty)(Q)}${(0, K1.getProperty)($)}`, errSchemaPath: `${X.errSchemaPath}/${Q}/${(0, F3.escapeFragment)($)}` };
    }
    if (Y !== void 0) {
      if (W === void 0 || J === void 0 || G === void 0) throw Error('"schemaPath", "errSchemaPath" and "topSchemaRef" are required with "schema"');
      return { schema: Y, schemaPath: W, topSchemaRef: G, errSchemaPath: J };
    }
    throw Error('either "keyword" or "schema" must be passed');
  }
  N3.getSubschema = sD;
  function eD(X, Q, { dataProp: $, dataPropType: Y, data: W, dataTypes: J, propertyName: G }) {
    if (W !== void 0 && $ !== void 0) throw Error('both "data" and "dataProp" passed, only one allowed');
    let { gen: H } = Q;
    if ($ !== void 0) {
      let { errorPath: z, dataPathArr: K, opts: V } = Q, L = H.let("data", K1._`${Q.data}${(0, K1.getProperty)($)}`, true);
      B(L), X.errorPath = K1.str`${z}${(0, F3.getErrorPath)($, Y, V.jsPropertySyntax)}`, X.parentDataProperty = K1._`${$}`, X.dataPathArr = [...K, X.parentDataProperty];
    }
    if (W !== void 0) {
      let z = W instanceof K1.Name ? W : H.let("data", W, true);
      if (B(z), G !== void 0) X.propertyName = G;
    }
    if (J) X.dataTypes = J;
    function B(z) {
      X.data = z, X.dataLevel = Q.dataLevel + 1, X.dataTypes = [], Q.definedProperties = /* @__PURE__ */ new Set(), X.parentData = Q.data, X.dataNames = [...Q.dataNames, z];
    }
  }
  N3.extendSubschemaData = eD;
  function Xw(X, { jtdDiscriminator: Q, jtdMetadata: $, compositeRule: Y, createErrors: W, allErrors: J }) {
    if (Y !== void 0) X.compositeRule = Y;
    if (W !== void 0) X.createErrors = W;
    if (J !== void 0) X.allErrors = J;
    X.jtdDiscriminator = Q, X.jtdMetadata = $;
  }
  N3.extendSubschemaMode = Xw;
});
var wY = P((JT, w3) => {
  w3.exports = function X(Q, $) {
    if (Q === $) return true;
    if (Q && $ && typeof Q == "object" && typeof $ == "object") {
      if (Q.constructor !== $.constructor) return false;
      var Y, W, J;
      if (Array.isArray(Q)) {
        if (Y = Q.length, Y != $.length) return false;
        for (W = Y; W-- !== 0; ) if (!X(Q[W], $[W])) return false;
        return true;
      }
      if (Q.constructor === RegExp) return Q.source === $.source && Q.flags === $.flags;
      if (Q.valueOf !== Object.prototype.valueOf) return Q.valueOf() === $.valueOf();
      if (Q.toString !== Object.prototype.toString) return Q.toString() === $.toString();
      if (J = Object.keys(Q), Y = J.length, Y !== Object.keys($).length) return false;
      for (W = Y; W-- !== 0; ) if (!Object.prototype.hasOwnProperty.call($, J[W])) return false;
      for (W = Y; W-- !== 0; ) {
        var G = J[W];
        if (!X(Q[G], $[G])) return false;
      }
      return true;
    }
    return Q !== Q && $ !== $;
  };
});
var M3 = P((GT, A3) => {
  var d1 = A3.exports = function(X, Q, $) {
    if (typeof Q == "function") $ = Q, Q = {};
    $ = Q.cb || $;
    var Y = typeof $ == "function" ? $ : $.pre || function() {
    }, W = $.post || function() {
    };
    k8(Q, Y, W, X, "", X);
  };
  d1.keywords = { additionalItems: true, items: true, contains: true, additionalProperties: true, propertyNames: true, not: true, if: true, then: true, else: true };
  d1.arrayKeywords = { items: true, allOf: true, anyOf: true, oneOf: true };
  d1.propsKeywords = { $defs: true, definitions: true, properties: true, patternProperties: true, dependencies: true };
  d1.skipKeywords = { default: true, enum: true, const: true, required: true, maximum: true, minimum: true, exclusiveMaximum: true, exclusiveMinimum: true, multipleOf: true, maxLength: true, minLength: true, pattern: true, format: true, maxItems: true, minItems: true, uniqueItems: true, maxProperties: true, minProperties: true };
  function k8(X, Q, $, Y, W, J, G, H, B, z) {
    if (Y && typeof Y == "object" && !Array.isArray(Y)) {
      Q(Y, W, J, G, H, B, z);
      for (var K in Y) {
        var V = Y[K];
        if (Array.isArray(V)) {
          if (K in d1.arrayKeywords) for (var L = 0; L < V.length; L++) k8(X, Q, $, V[L], W + "/" + K + "/" + L, J, W, K, Y, L);
        } else if (K in d1.propsKeywords) {
          if (V && typeof V == "object") for (var U in V) k8(X, Q, $, V[U], W + "/" + K + "/" + Yw(U), J, W, K, Y, U);
        } else if (K in d1.keywords || X.allKeys && !(K in d1.skipKeywords)) k8(X, Q, $, V, W + "/" + K, J, W, K, Y);
      }
      $(Y, W, J, G, H, B, z);
    }
  }
  function Yw(X) {
    return X.replace(/~/g, "~0").replace(/\//g, "~1");
  }
});
var mX = P((E3) => {
  Object.defineProperty(E3, "__esModule", { value: true });
  E3.getSchemaRefs = E3.resolveUrl = E3.normalizeId = E3._getFullPath = E3.getFullPath = E3.inlineRef = void 0;
  var Ww = e(), Jw = wY(), Gw = M3(), Hw = /* @__PURE__ */ new Set(["type", "format", "pattern", "maxLength", "minLength", "maxProperties", "minProperties", "maxItems", "minItems", "maximum", "minimum", "uniqueItems", "multipleOf", "required", "enum", "const"]);
  function Bw(X, Q = true) {
    if (typeof X == "boolean") return true;
    if (Q === true) return !AY(X);
    if (!Q) return false;
    return j3(X) <= Q;
  }
  E3.inlineRef = Bw;
  var zw = /* @__PURE__ */ new Set(["$ref", "$recursiveRef", "$recursiveAnchor", "$dynamicRef", "$dynamicAnchor"]);
  function AY(X) {
    for (let Q in X) {
      if (zw.has(Q)) return true;
      let $ = X[Q];
      if (Array.isArray($) && $.some(AY)) return true;
      if (typeof $ == "object" && AY($)) return true;
    }
    return false;
  }
  function j3(X) {
    let Q = 0;
    for (let $ in X) {
      if ($ === "$ref") return 1 / 0;
      if (Q++, Hw.has($)) continue;
      if (typeof X[$] == "object") (0, Ww.eachItem)(X[$], (Y) => Q += j3(Y));
      if (Q === 1 / 0) return 1 / 0;
    }
    return Q;
  }
  function R3(X, Q = "", $) {
    if ($ !== false) Q = p6(Q);
    let Y = X.parse(Q);
    return I3(X, Y);
  }
  E3.getFullPath = R3;
  function I3(X, Q) {
    return X.serialize(Q).split("#")[0] + "#";
  }
  E3._getFullPath = I3;
  var Kw = /#\/?$/;
  function p6(X) {
    return X ? X.replace(Kw, "") : "";
  }
  E3.normalizeId = p6;
  function Uw(X, Q, $) {
    return $ = p6($), X.resolve(Q, $);
  }
  E3.resolveUrl = Uw;
  var Vw = /^[a-z_][-a-z0-9._]*$/i;
  function Lw(X, Q) {
    if (typeof X == "boolean") return {};
    let { schemaId: $, uriResolver: Y } = this.opts, W = p6(X[$] || Q), J = { "": W }, G = R3(Y, W, false), H = {}, B = /* @__PURE__ */ new Set();
    return Gw(X, { allKeys: true }, (V, L, U, F) => {
      if (F === void 0) return;
      let q = G + L, N = J[F];
      if (typeof V[$] == "string") N = w.call(this, V[$]);
      M.call(this, V.$anchor), M.call(this, V.$dynamicAnchor), J[L] = N;
      function w(R) {
        let S = this.opts.uriResolver.resolve;
        if (R = p6(N ? S(N, R) : R), B.has(R)) throw K(R);
        B.add(R);
        let C = this.refs[R];
        if (typeof C == "string") C = this.refs[C];
        if (typeof C == "object") z(V, C.schema, R);
        else if (R !== p6(q)) if (R[0] === "#") z(V, H[R], R), H[R] = V;
        else this.refs[R] = q;
        return R;
      }
      function M(R) {
        if (typeof R == "string") {
          if (!Vw.test(R)) throw Error(`invalid anchor "${R}"`);
          w.call(this, `#${R}`);
        }
      }
    }), H;
    function z(V, L, U) {
      if (L !== void 0 && !Jw(V, L)) throw K(U);
    }
    function K(V) {
      return Error(`reference "${V}" resolves to more than one schema`);
    }
  }
  E3.getSchemaRefs = Lw;
});
var dX = P((l3) => {
  Object.defineProperty(l3, "__esModule", { value: true });
  l3.getData = l3.KeywordCxt = l3.validateFunctionCode = void 0;
  var k3 = pG(), P3 = lX(), jY = VY(), v8 = lX(), ww = J3(), pX = q3(), MY = D3(), _ = p(), u = R1(), Aw = mX(), I1 = e(), cX = uX();
  function Mw(X) {
    if (_3(X)) {
      if (x3(X), T3(X)) {
        Iw(X);
        return;
      }
    }
    v3(X, () => (0, k3.topBoolOrEmptySchema)(X));
  }
  l3.validateFunctionCode = Mw;
  function v3({ gen: X, validateName: Q, schema: $, schemaEnv: Y, opts: W }, J) {
    if (W.code.es5) X.func(Q, _._`${u.default.data}, ${u.default.valCxt}`, Y.$async, () => {
      X.code(_._`"use strict"; ${S3($, W)}`), Rw(X, W), X.code(J);
    });
    else X.func(Q, _._`${u.default.data}, ${jw(W)}`, Y.$async, () => X.code(S3($, W)).code(J));
  }
  function jw(X) {
    return _._`{${u.default.instancePath}="", ${u.default.parentData}, ${u.default.parentDataProperty}, ${u.default.rootData}=${u.default.data}${X.dynamicRef ? _._`, ${u.default.dynamicAnchors}={}` : _.nil}}={}`;
  }
  function Rw(X, Q) {
    X.if(u.default.valCxt, () => {
      if (X.var(u.default.instancePath, _._`${u.default.valCxt}.${u.default.instancePath}`), X.var(u.default.parentData, _._`${u.default.valCxt}.${u.default.parentData}`), X.var(u.default.parentDataProperty, _._`${u.default.valCxt}.${u.default.parentDataProperty}`), X.var(u.default.rootData, _._`${u.default.valCxt}.${u.default.rootData}`), Q.dynamicRef) X.var(u.default.dynamicAnchors, _._`${u.default.valCxt}.${u.default.dynamicAnchors}`);
    }, () => {
      if (X.var(u.default.instancePath, _._`""`), X.var(u.default.parentData, _._`undefined`), X.var(u.default.parentDataProperty, _._`undefined`), X.var(u.default.rootData, u.default.data), Q.dynamicRef) X.var(u.default.dynamicAnchors, _._`{}`);
    });
  }
  function Iw(X) {
    let { schema: Q, opts: $, gen: Y } = X;
    v3(X, () => {
      if ($.$comment && Q.$comment) g3(X);
      if (Zw(X), Y.let(u.default.vErrors, null), Y.let(u.default.errors, 0), $.unevaluated) Ew(X);
      y3(X), vw(X);
    });
    return;
  }
  function Ew(X) {
    let { gen: Q, validateName: $ } = X;
    X.evaluated = Q.const("evaluated", _._`${$}.evaluated`), Q.if(_._`${X.evaluated}.dynamicProps`, () => Q.assign(_._`${X.evaluated}.props`, _._`undefined`)), Q.if(_._`${X.evaluated}.dynamicItems`, () => Q.assign(_._`${X.evaluated}.items`, _._`undefined`));
  }
  function S3(X, Q) {
    let $ = typeof X == "object" && X[Q.schemaId];
    return $ && (Q.code.source || Q.code.process) ? _._`/*# sourceURL=${$} */` : _.nil;
  }
  function bw(X, Q) {
    if (_3(X)) {
      if (x3(X), T3(X)) {
        Pw(X, Q);
        return;
      }
    }
    (0, k3.boolOrEmptySchema)(X, Q);
  }
  function T3({ schema: X, self: Q }) {
    if (typeof X == "boolean") return !X;
    for (let $ in X) if (Q.RULES.all[$]) return true;
    return false;
  }
  function _3(X) {
    return typeof X.schema != "boolean";
  }
  function Pw(X, Q) {
    let { schema: $, gen: Y, opts: W } = X;
    if (W.$comment && $.$comment) g3(X);
    Cw(X), kw(X);
    let J = Y.const("_errs", u.default.errors);
    y3(X, J), Y.var(Q, _._`${J} === ${u.default.errors}`);
  }
  function x3(X) {
    (0, I1.checkUnknownRules)(X), Sw(X);
  }
  function y3(X, Q) {
    if (X.opts.jtd) return Z3(X, [], false, Q);
    let $ = (0, P3.getSchemaTypes)(X.schema), Y = (0, P3.coerceAndCheckDataType)(X, $);
    Z3(X, $, !Y, Q);
  }
  function Sw(X) {
    let { schema: Q, errSchemaPath: $, opts: Y, self: W } = X;
    if (Q.$ref && Y.ignoreKeywordsWithRef && (0, I1.schemaHasRulesButRef)(Q, W.RULES)) W.logger.warn(`$ref: keywords ignored in schema at path "${$}"`);
  }
  function Zw(X) {
    let { schema: Q, opts: $ } = X;
    if (Q.default !== void 0 && $.useDefaults && $.strictSchema) (0, I1.checkStrictMode)(X, "default is ignored in the schema root");
  }
  function Cw(X) {
    let Q = X.schema[X.opts.schemaId];
    if (Q) X.baseId = (0, Aw.resolveUrl)(X.opts.uriResolver, X.baseId, Q);
  }
  function kw(X) {
    if (X.schema.$async && !X.schemaEnv.$async) throw Error("async schema in sync schema");
  }
  function g3({ gen: X, schemaEnv: Q, schema: $, errSchemaPath: Y, opts: W }) {
    let J = $.$comment;
    if (W.$comment === true) X.code(_._`${u.default.self}.logger.log(${J})`);
    else if (typeof W.$comment == "function") {
      let G = _.str`${Y}/$comment`, H = X.scopeValue("root", { ref: Q.root });
      X.code(_._`${u.default.self}.opts.$comment(${J}, ${G}, ${H}.schema)`);
    }
  }
  function vw(X) {
    let { gen: Q, schemaEnv: $, validateName: Y, ValidationError: W, opts: J } = X;
    if ($.$async) Q.if(_._`${u.default.errors} === 0`, () => Q.return(u.default.data), () => Q.throw(_._`new ${W}(${u.default.vErrors})`));
    else {
      if (Q.assign(_._`${Y}.errors`, u.default.vErrors), J.unevaluated) Tw(X);
      Q.return(_._`${u.default.errors} === 0`);
    }
  }
  function Tw({ gen: X, evaluated: Q, props: $, items: Y }) {
    if ($ instanceof _.Name) X.assign(_._`${Q}.props`, $);
    if (Y instanceof _.Name) X.assign(_._`${Q}.items`, Y);
  }
  function Z3(X, Q, $, Y) {
    let { gen: W, schema: J, data: G, allErrors: H, opts: B, self: z } = X, { RULES: K } = z;
    if (J.$ref && (B.ignoreKeywordsWithRef || !(0, I1.schemaHasRulesButRef)(J, K))) {
      W.block(() => h3(X, "$ref", K.all.$ref.definition));
      return;
    }
    if (!B.jtd) _w(X, Q);
    W.block(() => {
      for (let L of K.rules) V(L);
      V(K.post);
    });
    function V(L) {
      if (!(0, jY.shouldUseGroup)(J, L)) return;
      if (L.type) {
        if (W.if((0, v8.checkDataType)(L.type, G, B.strictNumbers)), C3(X, L), Q.length === 1 && Q[0] === L.type && $) W.else(), (0, v8.reportTypeError)(X);
        W.endIf();
      } else C3(X, L);
      if (!H) W.if(_._`${u.default.errors} === ${Y || 0}`);
    }
  }
  function C3(X, Q) {
    let { gen: $, schema: Y, opts: { useDefaults: W } } = X;
    if (W) (0, ww.assignDefaults)(X, Q.type);
    $.block(() => {
      for (let J of Q.rules) if ((0, jY.shouldUseRule)(Y, J)) h3(X, J.keyword, J.definition, Q.type);
    });
  }
  function _w(X, Q) {
    if (X.schemaEnv.meta || !X.opts.strictTypes) return;
    if (xw(X, Q), !X.opts.allowUnionTypes) yw(X, Q);
    gw(X, X.dataTypes);
  }
  function xw(X, Q) {
    if (!Q.length) return;
    if (!X.dataTypes.length) {
      X.dataTypes = Q;
      return;
    }
    Q.forEach(($) => {
      if (!f3(X.dataTypes, $)) RY(X, `type "${$}" not allowed by context "${X.dataTypes.join(",")}"`);
    }), hw(X, Q);
  }
  function yw(X, Q) {
    if (Q.length > 1 && !(Q.length === 2 && Q.includes("null"))) RY(X, "use allowUnionTypes to allow union type keyword");
  }
  function gw(X, Q) {
    let $ = X.self.RULES.all;
    for (let Y in $) {
      let W = $[Y];
      if (typeof W == "object" && (0, jY.shouldUseRule)(X.schema, W)) {
        let { type: J } = W.definition;
        if (J.length && !J.some((G) => fw(Q, G))) RY(X, `missing type "${J.join(",")}" for keyword "${Y}"`);
      }
    }
  }
  function fw(X, Q) {
    return X.includes(Q) || Q === "number" && X.includes("integer");
  }
  function f3(X, Q) {
    return X.includes(Q) || Q === "integer" && X.includes("number");
  }
  function hw(X, Q) {
    let $ = [];
    for (let Y of X.dataTypes) if (f3(Q, Y)) $.push(Y);
    else if (Q.includes("integer") && Y === "number") $.push("integer");
    X.dataTypes = $;
  }
  function RY(X, Q) {
    let $ = X.schemaEnv.baseId + X.errSchemaPath;
    Q += ` at "${$}" (strictTypes)`, (0, I1.checkStrictMode)(X, Q, X.opts.strictTypes);
  }
  class IY {
    constructor(X, Q, $) {
      if ((0, pX.validateKeywordUsage)(X, Q, $), this.gen = X.gen, this.allErrors = X.allErrors, this.keyword = $, this.data = X.data, this.schema = X.schema[$], this.$data = Q.$data && X.opts.$data && this.schema && this.schema.$data, this.schemaValue = (0, I1.schemaRefOrVal)(X, this.schema, $, this.$data), this.schemaType = Q.schemaType, this.parentSchema = X.schema, this.params = {}, this.it = X, this.def = Q, this.$data) this.schemaCode = X.gen.const("vSchema", u3(this.$data, X));
      else if (this.schemaCode = this.schemaValue, !(0, pX.validSchemaType)(this.schema, Q.schemaType, Q.allowUndefined)) throw Error(`${$} value must be ${JSON.stringify(Q.schemaType)}`);
      if ("code" in Q ? Q.trackErrors : Q.errors !== false) this.errsCount = X.gen.const("_errs", u.default.errors);
    }
    result(X, Q, $) {
      this.failResult((0, _.not)(X), Q, $);
    }
    failResult(X, Q, $) {
      if (this.gen.if(X), $) $();
      else this.error();
      if (Q) {
        if (this.gen.else(), Q(), this.allErrors) this.gen.endIf();
      } else if (this.allErrors) this.gen.endIf();
      else this.gen.else();
    }
    pass(X, Q) {
      this.failResult((0, _.not)(X), void 0, Q);
    }
    fail(X) {
      if (X === void 0) {
        if (this.error(), !this.allErrors) this.gen.if(false);
        return;
      }
      if (this.gen.if(X), this.error(), this.allErrors) this.gen.endIf();
      else this.gen.else();
    }
    fail$data(X) {
      if (!this.$data) return this.fail(X);
      let { schemaCode: Q } = this;
      this.fail(_._`${Q} !== undefined && (${(0, _.or)(this.invalid$data(), X)})`);
    }
    error(X, Q, $) {
      if (Q) {
        this.setParams(Q), this._error(X, $), this.setParams({});
        return;
      }
      this._error(X, $);
    }
    _error(X, Q) {
      (X ? cX.reportExtraError : cX.reportError)(this, this.def.error, Q);
    }
    $dataError() {
      (0, cX.reportError)(this, this.def.$dataError || cX.keyword$DataError);
    }
    reset() {
      if (this.errsCount === void 0) throw Error('add "trackErrors" to keyword definition');
      (0, cX.resetErrorsCount)(this.gen, this.errsCount);
    }
    ok(X) {
      if (!this.allErrors) this.gen.if(X);
    }
    setParams(X, Q) {
      if (Q) Object.assign(this.params, X);
      else this.params = X;
    }
    block$data(X, Q, $ = _.nil) {
      this.gen.block(() => {
        this.check$data(X, $), Q();
      });
    }
    check$data(X = _.nil, Q = _.nil) {
      if (!this.$data) return;
      let { gen: $, schemaCode: Y, schemaType: W, def: J } = this;
      if ($.if((0, _.or)(_._`${Y} === undefined`, Q)), X !== _.nil) $.assign(X, true);
      if (W.length || J.validateSchema) {
        if ($.elseIf(this.invalid$data()), this.$dataError(), X !== _.nil) $.assign(X, false);
      }
      $.else();
    }
    invalid$data() {
      let { gen: X, schemaCode: Q, schemaType: $, def: Y, it: W } = this;
      return (0, _.or)(J(), G());
      function J() {
        if ($.length) {
          if (!(Q instanceof _.Name)) throw Error("ajv implementation error");
          let H = Array.isArray($) ? $ : [$];
          return _._`${(0, v8.checkDataTypes)(H, Q, W.opts.strictNumbers, v8.DataType.Wrong)}`;
        }
        return _.nil;
      }
      function G() {
        if (Y.validateSchema) {
          let H = X.scopeValue("validate$data", { ref: Y.validateSchema });
          return _._`!${H}(${Q})`;
        }
        return _.nil;
      }
    }
    subschema(X, Q) {
      let $ = (0, MY.getSubschema)(this.it, X);
      (0, MY.extendSubschemaData)($, this.it, X), (0, MY.extendSubschemaMode)($, X);
      let Y = { ...this.it, ...$, items: void 0, props: void 0 };
      return bw(Y, Q), Y;
    }
    mergeEvaluated(X, Q) {
      let { it: $, gen: Y } = this;
      if (!$.opts.unevaluated) return;
      if ($.props !== true && X.props !== void 0) $.props = I1.mergeEvaluated.props(Y, X.props, $.props, Q);
      if ($.items !== true && X.items !== void 0) $.items = I1.mergeEvaluated.items(Y, X.items, $.items, Q);
    }
    mergeValidEvaluated(X, Q) {
      let { it: $, gen: Y } = this;
      if ($.opts.unevaluated && ($.props !== true || $.items !== true)) return Y.if(Q, () => this.mergeEvaluated(X, _.Name)), true;
    }
  }
  l3.KeywordCxt = IY;
  function h3(X, Q, $, Y) {
    let W = new IY(X, $, Q);
    if ("code" in $) $.code(W, Y);
    else if (W.$data && $.validate) (0, pX.funcKeywordCode)(W, $);
    else if ("macro" in $) (0, pX.macroKeywordCode)(W, $);
    else if ($.compile || $.validate) (0, pX.funcKeywordCode)(W, $);
  }
  var uw = /^\/(?:[^~]|~0|~1)*$/, lw = /^([0-9]+)(#|\/(?:[^~]|~0|~1)*)?$/;
  function u3(X, { dataLevel: Q, dataNames: $, dataPathArr: Y }) {
    let W, J;
    if (X === "") return u.default.rootData;
    if (X[0] === "/") {
      if (!uw.test(X)) throw Error(`Invalid JSON-pointer: ${X}`);
      W = X, J = u.default.rootData;
    } else {
      let z = lw.exec(X);
      if (!z) throw Error(`Invalid JSON-pointer: ${X}`);
      let K = +z[1];
      if (W = z[2], W === "#") {
        if (K >= Q) throw Error(B("property/index", K));
        return Y[Q - K];
      }
      if (K > Q) throw Error(B("data", K));
      if (J = $[Q - K], !W) return J;
    }
    let G = J, H = W.split("/");
    for (let z of H) if (z) J = _._`${J}${(0, _.getProperty)((0, I1.unescapeJsonPointer)(z))}`, G = _._`${G} && ${J}`;
    return G;
    function B(z, K) {
      return `Cannot access ${z} ${K} levels up, current level is ${Q}`;
    }
  }
  l3.getData = u3;
});
var T8 = P((p3) => {
  Object.defineProperty(p3, "__esModule", { value: true });
  class c3 extends Error {
    constructor(X) {
      super("validation failed");
      this.errors = X, this.ajv = this.validation = true;
    }
  }
  p3.default = c3;
});
var iX = P((i3) => {
  Object.defineProperty(i3, "__esModule", { value: true });
  var EY = mX();
  class d3 extends Error {
    constructor(X, Q, $, Y) {
      super(Y || `can't resolve reference ${$} from id ${Q}`);
      this.missingRef = (0, EY.resolveUrl)(X, Q, $), this.missingSchema = (0, EY.normalizeId)((0, EY.getFullPath)(X, this.missingRef));
    }
  }
  i3.default = d3;
});
var x8 = P((o3) => {
  Object.defineProperty(o3, "__esModule", { value: true });
  o3.resolveSchema = o3.getCompilingSchema = o3.resolveRef = o3.compileSchema = o3.SchemaEnv = void 0;
  var X1 = p(), iw = T8(), K6 = R1(), Q1 = mX(), n3 = e(), nw = dX();
  class nX {
    constructor(X) {
      var Q;
      this.refs = {}, this.dynamicAnchors = {};
      let $;
      if (typeof X.schema == "object") $ = X.schema;
      this.schema = X.schema, this.schemaId = X.schemaId, this.root = X.root || this, this.baseId = (Q = X.baseId) !== null && Q !== void 0 ? Q : (0, Q1.normalizeId)($ === null || $ === void 0 ? void 0 : $[X.schemaId || "$id"]), this.schemaPath = X.schemaPath, this.localRefs = X.localRefs, this.meta = X.meta, this.$async = $ === null || $ === void 0 ? void 0 : $.$async, this.refs = {};
    }
  }
  o3.SchemaEnv = nX;
  function PY(X) {
    let Q = r3.call(this, X);
    if (Q) return Q;
    let $ = (0, Q1.getFullPath)(this.opts.uriResolver, X.root.baseId), { es5: Y, lines: W } = this.opts.code, { ownProperties: J } = this.opts, G = new X1.CodeGen(this.scope, { es5: Y, lines: W, ownProperties: J }), H;
    if (X.$async) H = G.scopeValue("Error", { ref: iw.default, code: X1._`require("ajv/dist/runtime/validation_error").default` });
    let B = G.scopeName("validate");
    X.validateName = B;
    let z = { gen: G, allErrors: this.opts.allErrors, data: K6.default.data, parentData: K6.default.parentData, parentDataProperty: K6.default.parentDataProperty, dataNames: [K6.default.data], dataPathArr: [X1.nil], dataLevel: 0, dataTypes: [], definedProperties: /* @__PURE__ */ new Set(), topSchemaRef: G.scopeValue("schema", this.opts.code.source === true ? { ref: X.schema, code: (0, X1.stringify)(X.schema) } : { ref: X.schema }), validateName: B, ValidationError: H, schema: X.schema, schemaEnv: X, rootId: $, baseId: X.baseId || $, schemaPath: X1.nil, errSchemaPath: X.schemaPath || (this.opts.jtd ? "" : "#"), errorPath: X1._`""`, opts: this.opts, self: this }, K;
    try {
      this._compilations.add(X), (0, nw.validateFunctionCode)(z), G.optimize(this.opts.code.optimize);
      let V = G.toString();
      if (K = `${G.scopeRefs(K6.default.scope)}return ${V}`, this.opts.code.process) K = this.opts.code.process(K, X);
      let U = Function(`${K6.default.self}`, `${K6.default.scope}`, K)(this, this.scope.get());
      if (this.scope.value(B, { ref: U }), U.errors = null, U.schema = X.schema, U.schemaEnv = X, X.$async) U.$async = true;
      if (this.opts.code.source === true) U.source = { validateName: B, validateCode: V, scopeValues: G._values };
      if (this.opts.unevaluated) {
        let { props: F, items: q } = z;
        if (U.evaluated = { props: F instanceof X1.Name ? void 0 : F, items: q instanceof X1.Name ? void 0 : q, dynamicProps: F instanceof X1.Name, dynamicItems: q instanceof X1.Name }, U.source) U.source.evaluated = (0, X1.stringify)(U.evaluated);
      }
      return X.validate = U, X;
    } catch (V) {
      if (delete X.validate, delete X.validateName, K) this.logger.error("Error compiling schema, function code:", K);
      throw V;
    } finally {
      this._compilations.delete(X);
    }
  }
  o3.compileSchema = PY;
  function rw(X, Q, $) {
    var Y;
    $ = (0, Q1.resolveUrl)(this.opts.uriResolver, Q, $);
    let W = X.refs[$];
    if (W) return W;
    let J = aw.call(this, X, $);
    if (J === void 0) {
      let G = (Y = X.localRefs) === null || Y === void 0 ? void 0 : Y[$], { schemaId: H } = this.opts;
      if (G) J = new nX({ schema: G, schemaId: H, root: X, baseId: Q });
    }
    if (J === void 0) return;
    return X.refs[$] = ow.call(this, J);
  }
  o3.resolveRef = rw;
  function ow(X) {
    if ((0, Q1.inlineRef)(X.schema, this.opts.inlineRefs)) return X.schema;
    return X.validate ? X : PY.call(this, X);
  }
  function r3(X) {
    for (let Q of this._compilations) if (tw(Q, X)) return Q;
  }
  o3.getCompilingSchema = r3;
  function tw(X, Q) {
    return X.schema === Q.schema && X.root === Q.root && X.baseId === Q.baseId;
  }
  function aw(X, Q) {
    let $;
    while (typeof ($ = this.refs[Q]) == "string") Q = $;
    return $ || this.schemas[Q] || _8.call(this, X, Q);
  }
  function _8(X, Q) {
    let $ = this.opts.uriResolver.parse(Q), Y = (0, Q1._getFullPath)(this.opts.uriResolver, $), W = (0, Q1.getFullPath)(this.opts.uriResolver, X.baseId, void 0);
    if (Object.keys(X.schema).length > 0 && Y === W) return bY.call(this, $, X);
    let J = (0, Q1.normalizeId)(Y), G = this.refs[J] || this.schemas[J];
    if (typeof G == "string") {
      let H = _8.call(this, X, G);
      if (typeof (H === null || H === void 0 ? void 0 : H.schema) !== "object") return;
      return bY.call(this, $, H);
    }
    if (typeof (G === null || G === void 0 ? void 0 : G.schema) !== "object") return;
    if (!G.validate) PY.call(this, G);
    if (J === (0, Q1.normalizeId)(Q)) {
      let { schema: H } = G, { schemaId: B } = this.opts, z = H[B];
      if (z) W = (0, Q1.resolveUrl)(this.opts.uriResolver, W, z);
      return new nX({ schema: H, schemaId: B, root: X, baseId: W });
    }
    return bY.call(this, $, G);
  }
  o3.resolveSchema = _8;
  var sw = /* @__PURE__ */ new Set(["properties", "patternProperties", "enum", "dependencies", "definitions"]);
  function bY(X, { baseId: Q, schema: $, root: Y }) {
    var W;
    if (((W = X.fragment) === null || W === void 0 ? void 0 : W[0]) !== "/") return;
    for (let H of X.fragment.slice(1).split("/")) {
      if (typeof $ === "boolean") return;
      let B = $[(0, n3.unescapeFragment)(H)];
      if (B === void 0) return;
      $ = B;
      let z = typeof $ === "object" && $[this.opts.schemaId];
      if (!sw.has(H) && z) Q = (0, Q1.resolveUrl)(this.opts.uriResolver, Q, z);
    }
    let J;
    if (typeof $ != "boolean" && $.$ref && !(0, n3.schemaHasRulesButRef)($, this.RULES)) {
      let H = (0, Q1.resolveUrl)(this.opts.uriResolver, Q, $.$ref);
      J = _8.call(this, Y, H);
    }
    let { schemaId: G } = this.opts;
    if (J = J || new nX({ schema: $, schemaId: G, root: Y, baseId: Q }), J.schema !== J.root.schema) return J;
    return;
  }
});
var a3 = P((VT, YA) => {
  YA.exports = { $id: "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#", description: "Meta-schema for $data reference (JSON AnySchema extension proposal)", type: "object", required: ["$data"], properties: { $data: { type: "string", anyOf: [{ format: "relative-json-pointer" }, { format: "json-pointer" }] } }, additionalProperties: false };
});
var e3 = P((LT, s3) => {
  var WA = { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9, a: 10, A: 10, b: 11, B: 11, c: 12, C: 12, d: 13, D: 13, e: 14, E: 14, f: 15, F: 15 };
  s3.exports = { HEX: WA };
});
var HH = P((qT, GH) => {
  var { HEX: JA } = e3(), GA = /^(?:(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)$/u;
  function YH(X) {
    if (JH(X, ".") < 3) return { host: X, isIPV4: false };
    let Q = X.match(GA) || [], [$] = Q;
    if ($) return { host: BA($, "."), isIPV4: true };
    else return { host: X, isIPV4: false };
  }
  function SY(X, Q = false) {
    let $ = "", Y = true;
    for (let W of X) {
      if (JA[W] === void 0) return;
      if (W !== "0" && Y === true) Y = false;
      if (!Y) $ += W;
    }
    if (Q && $.length === 0) $ = "0";
    return $;
  }
  function HA(X) {
    let Q = 0, $ = { error: false, address: "", zone: "" }, Y = [], W = [], J = false, G = false, H = false;
    function B() {
      if (W.length) {
        if (J === false) {
          let z = SY(W);
          if (z !== void 0) Y.push(z);
          else return $.error = true, false;
        }
        W.length = 0;
      }
      return true;
    }
    for (let z = 0; z < X.length; z++) {
      let K = X[z];
      if (K === "[" || K === "]") continue;
      if (K === ":") {
        if (G === true) H = true;
        if (!B()) break;
        if (Q++, Y.push(":"), Q > 7) {
          $.error = true;
          break;
        }
        if (z - 1 >= 0 && X[z - 1] === ":") G = true;
        continue;
      } else if (K === "%") {
        if (!B()) break;
        J = true;
      } else {
        W.push(K);
        continue;
      }
    }
    if (W.length) if (J) $.zone = W.join("");
    else if (H) Y.push(W.join(""));
    else Y.push(SY(W));
    return $.address = Y.join(""), $;
  }
  function WH(X) {
    if (JH(X, ":") < 2) return { host: X, isIPV6: false };
    let Q = HA(X);
    if (!Q.error) {
      let { address: $, address: Y } = Q;
      if (Q.zone) $ += "%" + Q.zone, Y += "%25" + Q.zone;
      return { host: $, escapedHost: Y, isIPV6: true };
    } else return { host: X, isIPV6: false };
  }
  function BA(X, Q) {
    let $ = "", Y = true, W = X.length;
    for (let J = 0; J < W; J++) {
      let G = X[J];
      if (G === "0" && Y) {
        if (J + 1 <= W && X[J + 1] === Q || J + 1 === W) $ += G, Y = false;
      } else {
        if (G === Q) Y = true;
        else Y = false;
        $ += G;
      }
    }
    return $;
  }
  function JH(X, Q) {
    let $ = 0;
    for (let Y = 0; Y < X.length; Y++) if (X[Y] === Q) $++;
    return $;
  }
  var XH = /^\.\.?\//u, QH = /^\/\.(?:\/|$)/u, $H = /^\/\.\.(?:\/|$)/u, zA = /^\/?(?:.|\n)*?(?=\/|$)/u;
  function KA(X) {
    let Q = [];
    while (X.length) if (X.match(XH)) X = X.replace(XH, "");
    else if (X.match(QH)) X = X.replace(QH, "/");
    else if (X.match($H)) X = X.replace($H, "/"), Q.pop();
    else if (X === "." || X === "..") X = "";
    else {
      let $ = X.match(zA);
      if ($) {
        let Y = $[0];
        X = X.slice(Y.length), Q.push(Y);
      } else throw Error("Unexpected dot segment condition");
    }
    return Q.join("");
  }
  function UA(X, Q) {
    let $ = Q !== true ? escape : unescape;
    if (X.scheme !== void 0) X.scheme = $(X.scheme);
    if (X.userinfo !== void 0) X.userinfo = $(X.userinfo);
    if (X.host !== void 0) X.host = $(X.host);
    if (X.path !== void 0) X.path = $(X.path);
    if (X.query !== void 0) X.query = $(X.query);
    if (X.fragment !== void 0) X.fragment = $(X.fragment);
    return X;
  }
  function VA(X) {
    let Q = [];
    if (X.userinfo !== void 0) Q.push(X.userinfo), Q.push("@");
    if (X.host !== void 0) {
      let $ = unescape(X.host), Y = YH($);
      if (Y.isIPV4) $ = Y.host;
      else {
        let W = WH(Y.host);
        if (W.isIPV6 === true) $ = `[${W.escapedHost}]`;
        else $ = X.host;
      }
      Q.push($);
    }
    if (typeof X.port === "number" || typeof X.port === "string") Q.push(":"), Q.push(String(X.port));
    return Q.length ? Q.join("") : void 0;
  }
  GH.exports = { recomposeAuthority: VA, normalizeComponentEncoding: UA, removeDotSegments: KA, normalizeIPv4: YH, normalizeIPv6: WH, stringArrayToHexStripped: SY };
});
var LH = P((FT, VH) => {
  var LA = /^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/iu, qA = /([\da-z][\d\-a-z]{0,31}):((?:[\w!$'()*+,\-.:;=@]|%[\da-f]{2})+)/iu;
  function BH(X) {
    return typeof X.secure === "boolean" ? X.secure : String(X.scheme).toLowerCase() === "wss";
  }
  function zH(X) {
    if (!X.host) X.error = X.error || "HTTP URIs must have a host.";
    return X;
  }
  function KH(X) {
    let Q = String(X.scheme).toLowerCase() === "https";
    if (X.port === (Q ? 443 : 80) || X.port === "") X.port = void 0;
    if (!X.path) X.path = "/";
    return X;
  }
  function FA(X) {
    return X.secure = BH(X), X.resourceName = (X.path || "/") + (X.query ? "?" + X.query : ""), X.path = void 0, X.query = void 0, X;
  }
  function NA(X) {
    if (X.port === (BH(X) ? 443 : 80) || X.port === "") X.port = void 0;
    if (typeof X.secure === "boolean") X.scheme = X.secure ? "wss" : "ws", X.secure = void 0;
    if (X.resourceName) {
      let [Q, $] = X.resourceName.split("?");
      X.path = Q && Q !== "/" ? Q : void 0, X.query = $, X.resourceName = void 0;
    }
    return X.fragment = void 0, X;
  }
  function OA(X, Q) {
    if (!X.path) return X.error = "URN can not be parsed", X;
    let $ = X.path.match(qA);
    if ($) {
      let Y = Q.scheme || X.scheme || "urn";
      X.nid = $[1].toLowerCase(), X.nss = $[2];
      let W = `${Y}:${Q.nid || X.nid}`, J = ZY[W];
      if (X.path = void 0, J) X = J.parse(X, Q);
    } else X.error = X.error || "URN can not be parsed.";
    return X;
  }
  function DA(X, Q) {
    let $ = Q.scheme || X.scheme || "urn", Y = X.nid.toLowerCase(), W = `${$}:${Q.nid || Y}`, J = ZY[W];
    if (J) X = J.serialize(X, Q);
    let G = X, H = X.nss;
    return G.path = `${Y || Q.nid}:${H}`, Q.skipEscape = true, G;
  }
  function wA(X, Q) {
    let $ = X;
    if ($.uuid = $.nss, $.nss = void 0, !Q.tolerant && (!$.uuid || !LA.test($.uuid))) $.error = $.error || "UUID is not valid.";
    return $;
  }
  function AA(X) {
    let Q = X;
    return Q.nss = (X.uuid || "").toLowerCase(), Q;
  }
  var UH = { scheme: "http", domainHost: true, parse: zH, serialize: KH }, MA = { scheme: "https", domainHost: UH.domainHost, parse: zH, serialize: KH }, y8 = { scheme: "ws", domainHost: true, parse: FA, serialize: NA }, jA = { scheme: "wss", domainHost: y8.domainHost, parse: y8.parse, serialize: y8.serialize }, RA = { scheme: "urn", parse: OA, serialize: DA, skipNormalize: true }, IA = { scheme: "urn:uuid", parse: wA, serialize: AA, skipNormalize: true }, ZY = { http: UH, https: MA, ws: y8, wss: jA, urn: RA, "urn:uuid": IA };
  VH.exports = ZY;
});
var FH = P((NT, f8) => {
  var { normalizeIPv6: EA, normalizeIPv4: bA, removeDotSegments: rX, recomposeAuthority: PA, normalizeComponentEncoding: g8 } = HH(), CY = LH();
  function SA(X, Q) {
    if (typeof X === "string") X = U1(E1(X, Q), Q);
    else if (typeof X === "object") X = E1(U1(X, Q), Q);
    return X;
  }
  function ZA(X, Q, $) {
    let Y = Object.assign({ scheme: "null" }, $), W = qH(E1(X, Y), E1(Q, Y), Y, true);
    return U1(W, { ...Y, skipEscape: true });
  }
  function qH(X, Q, $, Y) {
    let W = {};
    if (!Y) X = E1(U1(X, $), $), Q = E1(U1(Q, $), $);
    if ($ = $ || {}, !$.tolerant && Q.scheme) W.scheme = Q.scheme, W.userinfo = Q.userinfo, W.host = Q.host, W.port = Q.port, W.path = rX(Q.path || ""), W.query = Q.query;
    else {
      if (Q.userinfo !== void 0 || Q.host !== void 0 || Q.port !== void 0) W.userinfo = Q.userinfo, W.host = Q.host, W.port = Q.port, W.path = rX(Q.path || ""), W.query = Q.query;
      else {
        if (!Q.path) if (W.path = X.path, Q.query !== void 0) W.query = Q.query;
        else W.query = X.query;
        else {
          if (Q.path.charAt(0) === "/") W.path = rX(Q.path);
          else {
            if ((X.userinfo !== void 0 || X.host !== void 0 || X.port !== void 0) && !X.path) W.path = "/" + Q.path;
            else if (!X.path) W.path = Q.path;
            else W.path = X.path.slice(0, X.path.lastIndexOf("/") + 1) + Q.path;
            W.path = rX(W.path);
          }
          W.query = Q.query;
        }
        W.userinfo = X.userinfo, W.host = X.host, W.port = X.port;
      }
      W.scheme = X.scheme;
    }
    return W.fragment = Q.fragment, W;
  }
  function CA(X, Q, $) {
    if (typeof X === "string") X = unescape(X), X = U1(g8(E1(X, $), true), { ...$, skipEscape: true });
    else if (typeof X === "object") X = U1(g8(X, true), { ...$, skipEscape: true });
    if (typeof Q === "string") Q = unescape(Q), Q = U1(g8(E1(Q, $), true), { ...$, skipEscape: true });
    else if (typeof Q === "object") Q = U1(g8(Q, true), { ...$, skipEscape: true });
    return X.toLowerCase() === Q.toLowerCase();
  }
  function U1(X, Q) {
    let $ = { host: X.host, scheme: X.scheme, userinfo: X.userinfo, port: X.port, path: X.path, query: X.query, nid: X.nid, nss: X.nss, uuid: X.uuid, fragment: X.fragment, reference: X.reference, resourceName: X.resourceName, secure: X.secure, error: "" }, Y = Object.assign({}, Q), W = [], J = CY[(Y.scheme || $.scheme || "").toLowerCase()];
    if (J && J.serialize) J.serialize($, Y);
    if ($.path !== void 0) if (!Y.skipEscape) {
      if ($.path = escape($.path), $.scheme !== void 0) $.path = $.path.split("%3A").join(":");
    } else $.path = unescape($.path);
    if (Y.reference !== "suffix" && $.scheme) W.push($.scheme, ":");
    let G = PA($);
    if (G !== void 0) {
      if (Y.reference !== "suffix") W.push("//");
      if (W.push(G), $.path && $.path.charAt(0) !== "/") W.push("/");
    }
    if ($.path !== void 0) {
      let H = $.path;
      if (!Y.absolutePath && (!J || !J.absolutePath)) H = rX(H);
      if (G === void 0) H = H.replace(/^\/\//u, "/%2F");
      W.push(H);
    }
    if ($.query !== void 0) W.push("?", $.query);
    if ($.fragment !== void 0) W.push("#", $.fragment);
    return W.join("");
  }
  var kA = Array.from({ length: 127 }, (X, Q) => /[^!"$&'()*+,\-.;=_`a-z{}~]/u.test(String.fromCharCode(Q)));
  function vA(X) {
    let Q = 0;
    for (let $ = 0, Y = X.length; $ < Y; ++$) if (Q = X.charCodeAt($), Q > 126 || kA[Q]) return true;
    return false;
  }
  var TA = /^(?:([^#/:?]+):)?(?:\/\/((?:([^#/?@]*)@)?(\[[^#/?\]]+\]|[^#/:?]*)(?::(\d*))?))?([^#?]*)(?:\?([^#]*))?(?:#((?:.|[\n\r])*))?/u;
  function E1(X, Q) {
    let $ = Object.assign({}, Q), Y = { scheme: void 0, userinfo: void 0, host: "", port: void 0, path: "", query: void 0, fragment: void 0 }, W = X.indexOf("%") !== -1, J = false;
    if ($.reference === "suffix") X = ($.scheme ? $.scheme + ":" : "") + "//" + X;
    let G = X.match(TA);
    if (G) {
      if (Y.scheme = G[1], Y.userinfo = G[3], Y.host = G[4], Y.port = parseInt(G[5], 10), Y.path = G[6] || "", Y.query = G[7], Y.fragment = G[8], isNaN(Y.port)) Y.port = G[5];
      if (Y.host) {
        let B = bA(Y.host);
        if (B.isIPV4 === false) {
          let z = EA(B.host);
          Y.host = z.host.toLowerCase(), J = z.isIPV6;
        } else Y.host = B.host, J = true;
      }
      if (Y.scheme === void 0 && Y.userinfo === void 0 && Y.host === void 0 && Y.port === void 0 && Y.query === void 0 && !Y.path) Y.reference = "same-document";
      else if (Y.scheme === void 0) Y.reference = "relative";
      else if (Y.fragment === void 0) Y.reference = "absolute";
      else Y.reference = "uri";
      if ($.reference && $.reference !== "suffix" && $.reference !== Y.reference) Y.error = Y.error || "URI is not a " + $.reference + " reference.";
      let H = CY[($.scheme || Y.scheme || "").toLowerCase()];
      if (!$.unicodeSupport && (!H || !H.unicodeSupport)) {
        if (Y.host && ($.domainHost || H && H.domainHost) && J === false && vA(Y.host)) try {
          Y.host = URL.domainToASCII(Y.host.toLowerCase());
        } catch (B) {
          Y.error = Y.error || "Host's domain name can not be converted to ASCII: " + B;
        }
      }
      if (!H || H && !H.skipNormalize) {
        if (W && Y.scheme !== void 0) Y.scheme = unescape(Y.scheme);
        if (W && Y.host !== void 0) Y.host = unescape(Y.host);
        if (Y.path) Y.path = escape(unescape(Y.path));
        if (Y.fragment) Y.fragment = encodeURI(decodeURIComponent(Y.fragment));
      }
      if (H && H.parse) H.parse(Y, $);
    } else Y.error = Y.error || "URI can not be parsed.";
    return Y;
  }
  var kY = { SCHEMES: CY, normalize: SA, resolve: ZA, resolveComponents: qH, equal: CA, serialize: U1, parse: E1 };
  f8.exports = kY;
  f8.exports.default = kY;
  f8.exports.fastUri = kY;
});
var DH = P((OH) => {
  Object.defineProperty(OH, "__esModule", { value: true });
  var NH = FH();
  NH.code = 'require("ajv/dist/runtime/uri").default';
  OH.default = NH;
});
var bH = P((b1) => {
  Object.defineProperty(b1, "__esModule", { value: true });
  b1.CodeGen = b1.Name = b1.nil = b1.stringify = b1.str = b1._ = b1.KeywordCxt = void 0;
  var xA = dX();
  Object.defineProperty(b1, "KeywordCxt", { enumerable: true, get: function() {
    return xA.KeywordCxt;
  } });
  var d6 = p();
  Object.defineProperty(b1, "_", { enumerable: true, get: function() {
    return d6._;
  } });
  Object.defineProperty(b1, "str", { enumerable: true, get: function() {
    return d6.str;
  } });
  Object.defineProperty(b1, "stringify", { enumerable: true, get: function() {
    return d6.stringify;
  } });
  Object.defineProperty(b1, "nil", { enumerable: true, get: function() {
    return d6.nil;
  } });
  Object.defineProperty(b1, "Name", { enumerable: true, get: function() {
    return d6.Name;
  } });
  Object.defineProperty(b1, "CodeGen", { enumerable: true, get: function() {
    return d6.CodeGen;
  } });
  var yA = T8(), RH = iX(), gA = UY(), oX = x8(), fA = p(), tX = mX(), h8 = lX(), TY = e(), wH = a3(), hA = DH(), IH = (X, Q) => new RegExp(X, Q);
  IH.code = "new RegExp";
  var uA = ["removeAdditional", "useDefaults", "coerceTypes"], lA = /* @__PURE__ */ new Set(["validate", "serialize", "parse", "wrapper", "root", "schema", "keyword", "pattern", "formats", "validate$data", "func", "obj", "Error"]), mA = { errorDataPath: "", format: "`validateFormats: false` can be used instead.", nullable: '"nullable" keyword is supported by default.', jsonPointers: "Deprecated jsPropertySyntax can be used instead.", extendRefs: "Deprecated ignoreKeywordsWithRef can be used instead.", missingRefs: "Pass empty schema with $id that should be ignored to ajv.addSchema.", processCode: "Use option `code: {process: (code, schemaEnv: object) => string}`", sourceCode: "Use option `code: {source: true}`", strictDefaults: "It is default now, see option `strict`.", strictKeywords: "It is default now, see option `strict`.", uniqueItems: '"uniqueItems" keyword is always validated.', unknownFormats: "Disable strict mode or pass `true` to `ajv.addFormat` (or `formats` option).", cache: "Map is used as cache, schema object as key.", serialize: "Map is used as cache, schema object as key.", ajvErrors: "It is default now." }, cA = { ignoreKeywordsWithRef: "", jsPropertySyntax: "", unicode: '"minLength"/"maxLength" account for unicode characters by default.' }, AH = 200;
  function pA(X) {
    var Q, $, Y, W, J, G, H, B, z, K, V, L, U, F, q, N, w, M, R, S, C, K0, U0, s, D0;
    let q0 = X.strict, L1 = (Q = X.code) === null || Q === void 0 ? void 0 : Q.optimize, P1 = L1 === true || L1 === void 0 ? 1 : L1 || 0, o1 = (Y = ($ = X.code) === null || $ === void 0 ? void 0 : $.regExp) !== null && Y !== void 0 ? Y : IH, m = (W = X.uriResolver) !== null && W !== void 0 ? W : hA.default;
    return { strictSchema: (G = (J = X.strictSchema) !== null && J !== void 0 ? J : q0) !== null && G !== void 0 ? G : true, strictNumbers: (B = (H = X.strictNumbers) !== null && H !== void 0 ? H : q0) !== null && B !== void 0 ? B : true, strictTypes: (K = (z = X.strictTypes) !== null && z !== void 0 ? z : q0) !== null && K !== void 0 ? K : "log", strictTuples: (L = (V = X.strictTuples) !== null && V !== void 0 ? V : q0) !== null && L !== void 0 ? L : "log", strictRequired: (F = (U = X.strictRequired) !== null && U !== void 0 ? U : q0) !== null && F !== void 0 ? F : false, code: X.code ? { ...X.code, optimize: P1, regExp: o1 } : { optimize: P1, regExp: o1 }, loopRequired: (q = X.loopRequired) !== null && q !== void 0 ? q : AH, loopEnum: (N = X.loopEnum) !== null && N !== void 0 ? N : AH, meta: (w = X.meta) !== null && w !== void 0 ? w : true, messages: (M = X.messages) !== null && M !== void 0 ? M : true, inlineRefs: (R = X.inlineRefs) !== null && R !== void 0 ? R : true, schemaId: (S = X.schemaId) !== null && S !== void 0 ? S : "$id", addUsedSchema: (C = X.addUsedSchema) !== null && C !== void 0 ? C : true, validateSchema: (K0 = X.validateSchema) !== null && K0 !== void 0 ? K0 : true, validateFormats: (U0 = X.validateFormats) !== null && U0 !== void 0 ? U0 : true, unicodeRegExp: (s = X.unicodeRegExp) !== null && s !== void 0 ? s : true, int32range: (D0 = X.int32range) !== null && D0 !== void 0 ? D0 : true, uriResolver: m };
  }
  class u8 {
    constructor(X = {}) {
      this.schemas = {}, this.refs = {}, this.formats = {}, this._compilations = /* @__PURE__ */ new Set(), this._loading = {}, this._cache = /* @__PURE__ */ new Map(), X = this.opts = { ...X, ...pA(X) };
      let { es5: Q, lines: $ } = this.opts.code;
      this.scope = new fA.ValueScope({ scope: {}, prefixes: lA, es5: Q, lines: $ }), this.logger = tA(X.logger);
      let Y = X.validateFormats;
      if (X.validateFormats = false, this.RULES = (0, gA.getRules)(), MH.call(this, mA, X, "NOT SUPPORTED"), MH.call(this, cA, X, "DEPRECATED", "warn"), this._metaOpts = rA.call(this), X.formats) iA.call(this);
      if (this._addVocabularies(), this._addDefaultMetaSchema(), X.keywords) nA.call(this, X.keywords);
      if (typeof X.meta == "object") this.addMetaSchema(X.meta);
      dA.call(this), X.validateFormats = Y;
    }
    _addVocabularies() {
      this.addKeyword("$async");
    }
    _addDefaultMetaSchema() {
      let { $data: X, meta: Q, schemaId: $ } = this.opts, Y = wH;
      if ($ === "id") Y = { ...wH }, Y.id = Y.$id, delete Y.$id;
      if (Q && X) this.addMetaSchema(Y, Y[$], false);
    }
    defaultMeta() {
      let { meta: X, schemaId: Q } = this.opts;
      return this.opts.defaultMeta = typeof X == "object" ? X[Q] || X : void 0;
    }
    validate(X, Q) {
      let $;
      if (typeof X == "string") {
        if ($ = this.getSchema(X), !$) throw Error(`no schema with key or ref "${X}"`);
      } else $ = this.compile(X);
      let Y = $(Q);
      if (!("$async" in $)) this.errors = $.errors;
      return Y;
    }
    compile(X, Q) {
      let $ = this._addSchema(X, Q);
      return $.validate || this._compileSchemaEnv($);
    }
    compileAsync(X, Q) {
      if (typeof this.opts.loadSchema != "function") throw Error("options.loadSchema should be a function");
      let { loadSchema: $ } = this.opts;
      return Y.call(this, X, Q);
      async function Y(z, K) {
        await W.call(this, z.$schema);
        let V = this._addSchema(z, K);
        return V.validate || J.call(this, V);
      }
      async function W(z) {
        if (z && !this.getSchema(z)) await Y.call(this, { $ref: z }, true);
      }
      async function J(z) {
        try {
          return this._compileSchemaEnv(z);
        } catch (K) {
          if (!(K instanceof RH.default)) throw K;
          return G.call(this, K), await H.call(this, K.missingSchema), J.call(this, z);
        }
      }
      function G({ missingSchema: z, missingRef: K }) {
        if (this.refs[z]) throw Error(`AnySchema ${z} is loaded but ${K} cannot be resolved`);
      }
      async function H(z) {
        let K = await B.call(this, z);
        if (!this.refs[z]) await W.call(this, K.$schema);
        if (!this.refs[z]) this.addSchema(K, z, Q);
      }
      async function B(z) {
        let K = this._loading[z];
        if (K) return K;
        try {
          return await (this._loading[z] = $(z));
        } finally {
          delete this._loading[z];
        }
      }
    }
    addSchema(X, Q, $, Y = this.opts.validateSchema) {
      if (Array.isArray(X)) {
        for (let J of X) this.addSchema(J, void 0, $, Y);
        return this;
      }
      let W;
      if (typeof X === "object") {
        let { schemaId: J } = this.opts;
        if (W = X[J], W !== void 0 && typeof W != "string") throw Error(`schema ${J} must be string`);
      }
      return Q = (0, tX.normalizeId)(Q || W), this._checkUnique(Q), this.schemas[Q] = this._addSchema(X, $, Q, Y, true), this;
    }
    addMetaSchema(X, Q, $ = this.opts.validateSchema) {
      return this.addSchema(X, Q, true, $), this;
    }
    validateSchema(X, Q) {
      if (typeof X == "boolean") return true;
      let $;
      if ($ = X.$schema, $ !== void 0 && typeof $ != "string") throw Error("$schema must be a string");
      if ($ = $ || this.opts.defaultMeta || this.defaultMeta(), !$) return this.logger.warn("meta-schema not available"), this.errors = null, true;
      let Y = this.validate($, X);
      if (!Y && Q) {
        let W = "schema is invalid: " + this.errorsText();
        if (this.opts.validateSchema === "log") this.logger.error(W);
        else throw Error(W);
      }
      return Y;
    }
    getSchema(X) {
      let Q;
      while (typeof (Q = jH.call(this, X)) == "string") X = Q;
      if (Q === void 0) {
        let { schemaId: $ } = this.opts, Y = new oX.SchemaEnv({ schema: {}, schemaId: $ });
        if (Q = oX.resolveSchema.call(this, Y, X), !Q) return;
        this.refs[X] = Q;
      }
      return Q.validate || this._compileSchemaEnv(Q);
    }
    removeSchema(X) {
      if (X instanceof RegExp) return this._removeAllSchemas(this.schemas, X), this._removeAllSchemas(this.refs, X), this;
      switch (typeof X) {
        case "undefined":
          return this._removeAllSchemas(this.schemas), this._removeAllSchemas(this.refs), this._cache.clear(), this;
        case "string": {
          let Q = jH.call(this, X);
          if (typeof Q == "object") this._cache.delete(Q.schema);
          return delete this.schemas[X], delete this.refs[X], this;
        }
        case "object": {
          let Q = X;
          this._cache.delete(Q);
          let $ = X[this.opts.schemaId];
          if ($) $ = (0, tX.normalizeId)($), delete this.schemas[$], delete this.refs[$];
          return this;
        }
        default:
          throw Error("ajv.removeSchema: invalid parameter");
      }
    }
    addVocabulary(X) {
      for (let Q of X) this.addKeyword(Q);
      return this;
    }
    addKeyword(X, Q) {
      let $;
      if (typeof X == "string") {
        if ($ = X, typeof Q == "object") this.logger.warn("these parameters are deprecated, see docs for addKeyword"), Q.keyword = $;
      } else if (typeof X == "object" && Q === void 0) {
        if (Q = X, $ = Q.keyword, Array.isArray($) && !$.length) throw Error("addKeywords: keyword must be string or non-empty array");
      } else throw Error("invalid addKeywords parameters");
      if (sA.call(this, $, Q), !Q) return (0, TY.eachItem)($, (W) => vY.call(this, W)), this;
      XM.call(this, Q);
      let Y = { ...Q, type: (0, h8.getJSONTypes)(Q.type), schemaType: (0, h8.getJSONTypes)(Q.schemaType) };
      return (0, TY.eachItem)($, Y.type.length === 0 ? (W) => vY.call(this, W, Y) : (W) => Y.type.forEach((J) => vY.call(this, W, Y, J))), this;
    }
    getKeyword(X) {
      let Q = this.RULES.all[X];
      return typeof Q == "object" ? Q.definition : !!Q;
    }
    removeKeyword(X) {
      let { RULES: Q } = this;
      delete Q.keywords[X], delete Q.all[X];
      for (let $ of Q.rules) {
        let Y = $.rules.findIndex((W) => W.keyword === X);
        if (Y >= 0) $.rules.splice(Y, 1);
      }
      return this;
    }
    addFormat(X, Q) {
      if (typeof Q == "string") Q = new RegExp(Q);
      return this.formats[X] = Q, this;
    }
    errorsText(X = this.errors, { separator: Q = ", ", dataVar: $ = "data" } = {}) {
      if (!X || X.length === 0) return "No errors";
      return X.map((Y) => `${$}${Y.instancePath} ${Y.message}`).reduce((Y, W) => Y + Q + W);
    }
    $dataMetaSchema(X, Q) {
      let $ = this.RULES.all;
      X = JSON.parse(JSON.stringify(X));
      for (let Y of Q) {
        let W = Y.split("/").slice(1), J = X;
        for (let G of W) J = J[G];
        for (let G in $) {
          let H = $[G];
          if (typeof H != "object") continue;
          let { $data: B } = H.definition, z = J[G];
          if (B && z) J[G] = EH(z);
        }
      }
      return X;
    }
    _removeAllSchemas(X, Q) {
      for (let $ in X) {
        let Y = X[$];
        if (!Q || Q.test($)) {
          if (typeof Y == "string") delete X[$];
          else if (Y && !Y.meta) this._cache.delete(Y.schema), delete X[$];
        }
      }
    }
    _addSchema(X, Q, $, Y = this.opts.validateSchema, W = this.opts.addUsedSchema) {
      let J, { schemaId: G } = this.opts;
      if (typeof X == "object") J = X[G];
      else if (this.opts.jtd) throw Error("schema must be object");
      else if (typeof X != "boolean") throw Error("schema must be object or boolean");
      let H = this._cache.get(X);
      if (H !== void 0) return H;
      $ = (0, tX.normalizeId)(J || $);
      let B = tX.getSchemaRefs.call(this, X, $);
      if (H = new oX.SchemaEnv({ schema: X, schemaId: G, meta: Q, baseId: $, localRefs: B }), this._cache.set(H.schema, H), W && !$.startsWith("#")) {
        if ($) this._checkUnique($);
        this.refs[$] = H;
      }
      if (Y) this.validateSchema(X, true);
      return H;
    }
    _checkUnique(X) {
      if (this.schemas[X] || this.refs[X]) throw Error(`schema with key or id "${X}" already exists`);
    }
    _compileSchemaEnv(X) {
      if (X.meta) this._compileMetaSchema(X);
      else oX.compileSchema.call(this, X);
      if (!X.validate) throw Error("ajv implementation error");
      return X.validate;
    }
    _compileMetaSchema(X) {
      let Q = this.opts;
      this.opts = this._metaOpts;
      try {
        oX.compileSchema.call(this, X);
      } finally {
        this.opts = Q;
      }
    }
  }
  u8.ValidationError = yA.default;
  u8.MissingRefError = RH.default;
  b1.default = u8;
  function MH(X, Q, $, Y = "error") {
    for (let W in X) {
      let J = W;
      if (J in Q) this.logger[Y](`${$}: option ${W}. ${X[J]}`);
    }
  }
  function jH(X) {
    return X = (0, tX.normalizeId)(X), this.schemas[X] || this.refs[X];
  }
  function dA() {
    let X = this.opts.schemas;
    if (!X) return;
    if (Array.isArray(X)) this.addSchema(X);
    else for (let Q in X) this.addSchema(X[Q], Q);
  }
  function iA() {
    for (let X in this.opts.formats) {
      let Q = this.opts.formats[X];
      if (Q) this.addFormat(X, Q);
    }
  }
  function nA(X) {
    if (Array.isArray(X)) {
      this.addVocabulary(X);
      return;
    }
    this.logger.warn("keywords option as map is deprecated, pass array");
    for (let Q in X) {
      let $ = X[Q];
      if (!$.keyword) $.keyword = Q;
      this.addKeyword($);
    }
  }
  function rA() {
    let X = { ...this.opts };
    for (let Q of uA) delete X[Q];
    return X;
  }
  var oA = { log() {
  }, warn() {
  }, error() {
  } };
  function tA(X) {
    if (X === false) return oA;
    if (X === void 0) return console;
    if (X.log && X.warn && X.error) return X;
    throw Error("logger must implement log, warn and error methods");
  }
  var aA = /^[a-z_$][a-z0-9_$:-]*$/i;
  function sA(X, Q) {
    let { RULES: $ } = this;
    if ((0, TY.eachItem)(X, (Y) => {
      if ($.keywords[Y]) throw Error(`Keyword ${Y} is already defined`);
      if (!aA.test(Y)) throw Error(`Keyword ${Y} has invalid name`);
    }), !Q) return;
    if (Q.$data && !("code" in Q || "validate" in Q)) throw Error('$data keyword must have "code" or "validate" function');
  }
  function vY(X, Q, $) {
    var Y;
    let W = Q === null || Q === void 0 ? void 0 : Q.post;
    if ($ && W) throw Error('keyword with "post" flag cannot have "type"');
    let { RULES: J } = this, G = W ? J.post : J.rules.find(({ type: B }) => B === $);
    if (!G) G = { type: $, rules: [] }, J.rules.push(G);
    if (J.keywords[X] = true, !Q) return;
    let H = { keyword: X, definition: { ...Q, type: (0, h8.getJSONTypes)(Q.type), schemaType: (0, h8.getJSONTypes)(Q.schemaType) } };
    if (Q.before) eA.call(this, G, H, Q.before);
    else G.rules.push(H);
    J.all[X] = H, (Y = Q.implements) === null || Y === void 0 || Y.forEach((B) => this.addKeyword(B));
  }
  function eA(X, Q, $) {
    let Y = X.rules.findIndex((W) => W.keyword === $);
    if (Y >= 0) X.rules.splice(Y, 0, Q);
    else X.rules.push(Q), this.logger.warn(`rule ${$} is not defined`);
  }
  function XM(X) {
    let { metaSchema: Q } = X;
    if (Q === void 0) return;
    if (X.$data && this.opts.$data) Q = EH(Q);
    X.validateSchema = this.compile(Q, true);
  }
  var QM = { $ref: "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#" };
  function EH(X) {
    return { anyOf: [X, QM] };
  }
});
var SH = P((PH) => {
  Object.defineProperty(PH, "__esModule", { value: true });
  var WM = { keyword: "id", code() {
    throw Error('NOT SUPPORTED: keyword "id", use "$id" for schema ID');
  } };
  PH.default = WM;
});
var _H = P((vH) => {
  Object.defineProperty(vH, "__esModule", { value: true });
  vH.callRef = vH.getValidate = void 0;
  var GM = iX(), ZH = d0(), g0 = p(), i6 = R1(), CH = x8(), l8 = e(), HM = { keyword: "$ref", schemaType: "string", code(X) {
    let { gen: Q, schema: $, it: Y } = X, { baseId: W, schemaEnv: J, validateName: G, opts: H, self: B } = Y, { root: z } = J;
    if (($ === "#" || $ === "#/") && W === z.baseId) return V();
    let K = CH.resolveRef.call(B, z, W, $);
    if (K === void 0) throw new GM.default(Y.opts.uriResolver, W, $);
    if (K instanceof CH.SchemaEnv) return L(K);
    return U(K);
    function V() {
      if (J === z) return m8(X, G, J, J.$async);
      let F = Q.scopeValue("root", { ref: z });
      return m8(X, g0._`${F}.validate`, z, z.$async);
    }
    function L(F) {
      let q = kH(X, F);
      m8(X, q, F, F.$async);
    }
    function U(F) {
      let q = Q.scopeValue("schema", H.code.source === true ? { ref: F, code: (0, g0.stringify)(F) } : { ref: F }), N = Q.name("valid"), w = X.subschema({ schema: F, dataTypes: [], schemaPath: g0.nil, topSchemaRef: q, errSchemaPath: $ }, N);
      X.mergeEvaluated(w), X.ok(N);
    }
  } };
  function kH(X, Q) {
    let { gen: $ } = X;
    return Q.validate ? $.scopeValue("validate", { ref: Q.validate }) : g0._`${$.scopeValue("wrapper", { ref: Q })}.validate`;
  }
  vH.getValidate = kH;
  function m8(X, Q, $, Y) {
    let { gen: W, it: J } = X, { allErrors: G, schemaEnv: H, opts: B } = J, z = B.passContext ? i6.default.this : g0.nil;
    if (Y) K();
    else V();
    function K() {
      if (!H.$async) throw Error("async schema referenced by sync schema");
      let F = W.let("valid");
      W.try(() => {
        if (W.code(g0._`await ${(0, ZH.callValidateCode)(X, Q, z)}`), U(Q), !G) W.assign(F, true);
      }, (q) => {
        if (W.if(g0._`!(${q} instanceof ${J.ValidationError})`, () => W.throw(q)), L(q), !G) W.assign(F, false);
      }), X.ok(F);
    }
    function V() {
      X.result((0, ZH.callValidateCode)(X, Q, z), () => U(Q), () => L(Q));
    }
    function L(F) {
      let q = g0._`${F}.errors`;
      W.assign(i6.default.vErrors, g0._`${i6.default.vErrors} === null ? ${q} : ${i6.default.vErrors}.concat(${q})`), W.assign(i6.default.errors, g0._`${i6.default.vErrors}.length`);
    }
    function U(F) {
      var q;
      if (!J.opts.unevaluated) return;
      let N = (q = $ === null || $ === void 0 ? void 0 : $.validate) === null || q === void 0 ? void 0 : q.evaluated;
      if (J.props !== true) if (N && !N.dynamicProps) {
        if (N.props !== void 0) J.props = l8.mergeEvaluated.props(W, N.props, J.props);
      } else {
        let w = W.var("props", g0._`${F}.evaluated.props`);
        J.props = l8.mergeEvaluated.props(W, w, J.props, g0.Name);
      }
      if (J.items !== true) if (N && !N.dynamicItems) {
        if (N.items !== void 0) J.items = l8.mergeEvaluated.items(W, N.items, J.items);
      } else {
        let w = W.var("items", g0._`${F}.evaluated.items`);
        J.items = l8.mergeEvaluated.items(W, w, J.items, g0.Name);
      }
    }
  }
  vH.callRef = m8;
  vH.default = HM;
});
var yH = P((xH) => {
  Object.defineProperty(xH, "__esModule", { value: true });
  var KM = SH(), UM = _H(), VM = ["$schema", "$id", "$defs", "$vocabulary", { keyword: "$comment" }, "definitions", KM.default, UM.default];
  xH.default = VM;
});
var fH = P((gH) => {
  Object.defineProperty(gH, "__esModule", { value: true });
  var c8 = p(), i1 = c8.operators, p8 = { maximum: { okStr: "<=", ok: i1.LTE, fail: i1.GT }, minimum: { okStr: ">=", ok: i1.GTE, fail: i1.LT }, exclusiveMaximum: { okStr: "<", ok: i1.LT, fail: i1.GTE }, exclusiveMinimum: { okStr: ">", ok: i1.GT, fail: i1.LTE } }, qM = { message: ({ keyword: X, schemaCode: Q }) => c8.str`must be ${p8[X].okStr} ${Q}`, params: ({ keyword: X, schemaCode: Q }) => c8._`{comparison: ${p8[X].okStr}, limit: ${Q}}` }, FM = { keyword: Object.keys(p8), type: "number", schemaType: "number", $data: true, error: qM, code(X) {
    let { keyword: Q, data: $, schemaCode: Y } = X;
    X.fail$data(c8._`${$} ${p8[Q].fail} ${Y} || isNaN(${$})`);
  } };
  gH.default = FM;
});
var uH = P((hH) => {
  Object.defineProperty(hH, "__esModule", { value: true });
  var aX = p(), OM = { message: ({ schemaCode: X }) => aX.str`must be multiple of ${X}`, params: ({ schemaCode: X }) => aX._`{multipleOf: ${X}}` }, DM = { keyword: "multipleOf", type: "number", schemaType: "number", $data: true, error: OM, code(X) {
    let { gen: Q, data: $, schemaCode: Y, it: W } = X, J = W.opts.multipleOfPrecision, G = Q.let("res"), H = J ? aX._`Math.abs(Math.round(${G}) - ${G}) > 1e-${J}` : aX._`${G} !== parseInt(${G})`;
    X.fail$data(aX._`(${Y} === 0 || (${G} = ${$}/${Y}, ${H}))`);
  } };
  hH.default = DM;
});
var cH = P((mH) => {
  Object.defineProperty(mH, "__esModule", { value: true });
  function lH(X) {
    let Q = X.length, $ = 0, Y = 0, W;
    while (Y < Q) if ($++, W = X.charCodeAt(Y++), W >= 55296 && W <= 56319 && Y < Q) {
      if (W = X.charCodeAt(Y), (W & 64512) === 56320) Y++;
    }
    return $;
  }
  mH.default = lH;
  lH.code = 'require("ajv/dist/runtime/ucs2length").default';
});
var dH = P((pH) => {
  Object.defineProperty(pH, "__esModule", { value: true });
  var U6 = p(), MM = e(), jM = cH(), RM = { message({ keyword: X, schemaCode: Q }) {
    let $ = X === "maxLength" ? "more" : "fewer";
    return U6.str`must NOT have ${$} than ${Q} characters`;
  }, params: ({ schemaCode: X }) => U6._`{limit: ${X}}` }, IM = { keyword: ["maxLength", "minLength"], type: "string", schemaType: "number", $data: true, error: RM, code(X) {
    let { keyword: Q, data: $, schemaCode: Y, it: W } = X, J = Q === "maxLength" ? U6.operators.GT : U6.operators.LT, G = W.opts.unicode === false ? U6._`${$}.length` : U6._`${(0, MM.useFunc)(X.gen, jM.default)}(${$})`;
    X.fail$data(U6._`${G} ${J} ${Y}`);
  } };
  pH.default = IM;
});
var nH = P((iH) => {
  Object.defineProperty(iH, "__esModule", { value: true });
  var bM = d0(), d8 = p(), PM = { message: ({ schemaCode: X }) => d8.str`must match pattern "${X}"`, params: ({ schemaCode: X }) => d8._`{pattern: ${X}}` }, SM = { keyword: "pattern", type: "string", schemaType: "string", $data: true, error: PM, code(X) {
    let { data: Q, $data: $, schema: Y, schemaCode: W, it: J } = X, G = J.opts.unicodeRegExp ? "u" : "", H = $ ? d8._`(new RegExp(${W}, ${G}))` : (0, bM.usePattern)(X, Y);
    X.fail$data(d8._`!${H}.test(${Q})`);
  } };
  iH.default = SM;
});
var oH = P((rH) => {
  Object.defineProperty(rH, "__esModule", { value: true });
  var sX = p(), CM = { message({ keyword: X, schemaCode: Q }) {
    let $ = X === "maxProperties" ? "more" : "fewer";
    return sX.str`must NOT have ${$} than ${Q} properties`;
  }, params: ({ schemaCode: X }) => sX._`{limit: ${X}}` }, kM = { keyword: ["maxProperties", "minProperties"], type: "object", schemaType: "number", $data: true, error: CM, code(X) {
    let { keyword: Q, data: $, schemaCode: Y } = X, W = Q === "maxProperties" ? sX.operators.GT : sX.operators.LT;
    X.fail$data(sX._`Object.keys(${$}).length ${W} ${Y}`);
  } };
  rH.default = kM;
});
var aH = P((tH) => {
  Object.defineProperty(tH, "__esModule", { value: true });
  var eX = d0(), X4 = p(), TM = e(), _M = { message: ({ params: { missingProperty: X } }) => X4.str`must have required property '${X}'`, params: ({ params: { missingProperty: X } }) => X4._`{missingProperty: ${X}}` }, xM = { keyword: "required", type: "object", schemaType: "array", $data: true, error: _M, code(X) {
    let { gen: Q, schema: $, schemaCode: Y, data: W, $data: J, it: G } = X, { opts: H } = G;
    if (!J && $.length === 0) return;
    let B = $.length >= H.loopRequired;
    if (G.allErrors) z();
    else K();
    if (H.strictRequired) {
      let U = X.parentSchema.properties, { definedProperties: F } = X.it;
      for (let q of $) if ((U === null || U === void 0 ? void 0 : U[q]) === void 0 && !F.has(q)) {
        let N = G.schemaEnv.baseId + G.errSchemaPath, w = `required property "${q}" is not defined at "${N}" (strictRequired)`;
        (0, TM.checkStrictMode)(G, w, G.opts.strictRequired);
      }
    }
    function z() {
      if (B || J) X.block$data(X4.nil, V);
      else for (let U of $) (0, eX.checkReportMissingProp)(X, U);
    }
    function K() {
      let U = Q.let("missing");
      if (B || J) {
        let F = Q.let("valid", true);
        X.block$data(F, () => L(U, F)), X.ok(F);
      } else Q.if((0, eX.checkMissingProp)(X, $, U)), (0, eX.reportMissingProp)(X, U), Q.else();
    }
    function V() {
      Q.forOf("prop", Y, (U) => {
        X.setParams({ missingProperty: U }), Q.if((0, eX.noPropertyInData)(Q, W, U, H.ownProperties), () => X.error());
      });
    }
    function L(U, F) {
      X.setParams({ missingProperty: U }), Q.forOf(U, Y, () => {
        Q.assign(F, (0, eX.propertyInData)(Q, W, U, H.ownProperties)), Q.if((0, X4.not)(F), () => {
          X.error(), Q.break();
        });
      }, X4.nil);
    }
  } };
  tH.default = xM;
});
var eH = P((sH) => {
  Object.defineProperty(sH, "__esModule", { value: true });
  var Q4 = p(), gM = { message({ keyword: X, schemaCode: Q }) {
    let $ = X === "maxItems" ? "more" : "fewer";
    return Q4.str`must NOT have ${$} than ${Q} items`;
  }, params: ({ schemaCode: X }) => Q4._`{limit: ${X}}` }, fM = { keyword: ["maxItems", "minItems"], type: "array", schemaType: "number", $data: true, error: gM, code(X) {
    let { keyword: Q, data: $, schemaCode: Y } = X, W = Q === "maxItems" ? Q4.operators.GT : Q4.operators.LT;
    X.fail$data(Q4._`${$}.length ${W} ${Y}`);
  } };
  sH.default = fM;
});
var i8 = P((QB) => {
  Object.defineProperty(QB, "__esModule", { value: true });
  var XB = wY();
  XB.code = 'require("ajv/dist/runtime/equal").default';
  QB.default = XB;
});
var YB = P(($B) => {
  Object.defineProperty($B, "__esModule", { value: true });
  var _Y = lX(), I0 = p(), lM = e(), mM = i8(), cM = { message: ({ params: { i: X, j: Q } }) => I0.str`must NOT have duplicate items (items ## ${Q} and ${X} are identical)`, params: ({ params: { i: X, j: Q } }) => I0._`{i: ${X}, j: ${Q}}` }, pM = { keyword: "uniqueItems", type: "array", schemaType: "boolean", $data: true, error: cM, code(X) {
    let { gen: Q, data: $, $data: Y, schema: W, parentSchema: J, schemaCode: G, it: H } = X;
    if (!Y && !W) return;
    let B = Q.let("valid"), z = J.items ? (0, _Y.getSchemaTypes)(J.items) : [];
    X.block$data(B, K, I0._`${G} === false`), X.ok(B);
    function K() {
      let F = Q.let("i", I0._`${$}.length`), q = Q.let("j");
      X.setParams({ i: F, j: q }), Q.assign(B, true), Q.if(I0._`${F} > 1`, () => (V() ? L : U)(F, q));
    }
    function V() {
      return z.length > 0 && !z.some((F) => F === "object" || F === "array");
    }
    function L(F, q) {
      let N = Q.name("item"), w = (0, _Y.checkDataTypes)(z, N, H.opts.strictNumbers, _Y.DataType.Wrong), M = Q.const("indices", I0._`{}`);
      Q.for(I0._`;${F}--;`, () => {
        if (Q.let(N, I0._`${$}[${F}]`), Q.if(w, I0._`continue`), z.length > 1) Q.if(I0._`typeof ${N} == "string"`, I0._`${N} += "_"`);
        Q.if(I0._`typeof ${M}[${N}] == "number"`, () => {
          Q.assign(q, I0._`${M}[${N}]`), X.error(), Q.assign(B, false).break();
        }).code(I0._`${M}[${N}] = ${F}`);
      });
    }
    function U(F, q) {
      let N = (0, lM.useFunc)(Q, mM.default), w = Q.name("outer");
      Q.label(w).for(I0._`;${F}--;`, () => Q.for(I0._`${q} = ${F}; ${q}--;`, () => Q.if(I0._`${N}(${$}[${F}], ${$}[${q}])`, () => {
        X.error(), Q.assign(B, false).break(w);
      })));
    }
  } };
  $B.default = pM;
});
var JB = P((WB) => {
  Object.defineProperty(WB, "__esModule", { value: true });
  var xY = p(), iM = e(), nM = i8(), rM = { message: "must be equal to constant", params: ({ schemaCode: X }) => xY._`{allowedValue: ${X}}` }, oM = { keyword: "const", $data: true, error: rM, code(X) {
    let { gen: Q, data: $, $data: Y, schemaCode: W, schema: J } = X;
    if (Y || J && typeof J == "object") X.fail$data(xY._`!${(0, iM.useFunc)(Q, nM.default)}(${$}, ${W})`);
    else X.fail(xY._`${J} !== ${$}`);
  } };
  WB.default = oM;
});
var HB = P((GB) => {
  Object.defineProperty(GB, "__esModule", { value: true });
  var $4 = p(), aM = e(), sM = i8(), eM = { message: "must be equal to one of the allowed values", params: ({ schemaCode: X }) => $4._`{allowedValues: ${X}}` }, Xj = { keyword: "enum", schemaType: "array", $data: true, error: eM, code(X) {
    let { gen: Q, data: $, $data: Y, schema: W, schemaCode: J, it: G } = X;
    if (!Y && W.length === 0) throw Error("enum must have non-empty array");
    let H = W.length >= G.opts.loopEnum, B, z = () => B !== null && B !== void 0 ? B : B = (0, aM.useFunc)(Q, sM.default), K;
    if (H || Y) K = Q.let("valid"), X.block$data(K, V);
    else {
      if (!Array.isArray(W)) throw Error("ajv implementation error");
      let U = Q.const("vSchema", J);
      K = (0, $4.or)(...W.map((F, q) => L(U, q)));
    }
    X.pass(K);
    function V() {
      Q.assign(K, false), Q.forOf("v", J, (U) => Q.if($4._`${z()}(${$}, ${U})`, () => Q.assign(K, true).break()));
    }
    function L(U, F) {
      let q = W[F];
      return typeof q === "object" && q !== null ? $4._`${z()}(${$}, ${U}[${F}])` : $4._`${$} === ${q}`;
    }
  } };
  GB.default = Xj;
});
var zB = P((BB) => {
  Object.defineProperty(BB, "__esModule", { value: true });
  var $j = fH(), Yj = uH(), Wj = dH(), Jj = nH(), Gj = oH(), Hj = aH(), Bj = eH(), zj = YB(), Kj = JB(), Uj = HB(), Vj = [$j.default, Yj.default, Wj.default, Jj.default, Gj.default, Hj.default, Bj.default, zj.default, { keyword: "type", schemaType: ["string", "array"] }, { keyword: "nullable", schemaType: "boolean" }, Kj.default, Uj.default];
  BB.default = Vj;
});
var gY = P((UB) => {
  Object.defineProperty(UB, "__esModule", { value: true });
  UB.validateAdditionalItems = void 0;
  var V6 = p(), yY = e(), qj = { message: ({ params: { len: X } }) => V6.str`must NOT have more than ${X} items`, params: ({ params: { len: X } }) => V6._`{limit: ${X}}` }, Fj = { keyword: "additionalItems", type: "array", schemaType: ["boolean", "object"], before: "uniqueItems", error: qj, code(X) {
    let { parentSchema: Q, it: $ } = X, { items: Y } = Q;
    if (!Array.isArray(Y)) {
      (0, yY.checkStrictMode)($, '"additionalItems" is ignored when "items" is not an array of schemas');
      return;
    }
    KB(X, Y);
  } };
  function KB(X, Q) {
    let { gen: $, schema: Y, data: W, keyword: J, it: G } = X;
    G.items = true;
    let H = $.const("len", V6._`${W}.length`);
    if (Y === false) X.setParams({ len: Q.length }), X.pass(V6._`${H} <= ${Q.length}`);
    else if (typeof Y == "object" && !(0, yY.alwaysValidSchema)(G, Y)) {
      let z = $.var("valid", V6._`${H} <= ${Q.length}`);
      $.if((0, V6.not)(z), () => B(z)), X.ok(z);
    }
    function B(z) {
      $.forRange("i", Q.length, H, (K) => {
        if (X.subschema({ keyword: J, dataProp: K, dataPropType: yY.Type.Num }, z), !G.allErrors) $.if((0, V6.not)(z), () => $.break());
      });
    }
  }
  UB.validateAdditionalItems = KB;
  UB.default = Fj;
});
var fY = P((FB) => {
  Object.defineProperty(FB, "__esModule", { value: true });
  FB.validateTuple = void 0;
  var LB = p(), n8 = e(), Oj = d0(), Dj = { keyword: "items", type: "array", schemaType: ["object", "array", "boolean"], before: "uniqueItems", code(X) {
    let { schema: Q, it: $ } = X;
    if (Array.isArray(Q)) return qB(X, "additionalItems", Q);
    if ($.items = true, (0, n8.alwaysValidSchema)($, Q)) return;
    X.ok((0, Oj.validateArray)(X));
  } };
  function qB(X, Q, $ = X.schema) {
    let { gen: Y, parentSchema: W, data: J, keyword: G, it: H } = X;
    if (K(W), H.opts.unevaluated && $.length && H.items !== true) H.items = n8.mergeEvaluated.items(Y, $.length, H.items);
    let B = Y.name("valid"), z = Y.const("len", LB._`${J}.length`);
    $.forEach((V, L) => {
      if ((0, n8.alwaysValidSchema)(H, V)) return;
      Y.if(LB._`${z} > ${L}`, () => X.subschema({ keyword: G, schemaProp: L, dataProp: L }, B)), X.ok(B);
    });
    function K(V) {
      let { opts: L, errSchemaPath: U } = H, F = $.length, q = F === V.minItems && (F === V.maxItems || V[Q] === false);
      if (L.strictTuples && !q) {
        let N = `"${G}" is ${F}-tuple, but minItems or maxItems/${Q} are not specified or different at path "${U}"`;
        (0, n8.checkStrictMode)(H, N, L.strictTuples);
      }
    }
  }
  FB.validateTuple = qB;
  FB.default = Dj;
});
var DB = P((OB) => {
  Object.defineProperty(OB, "__esModule", { value: true });
  var Aj = fY(), Mj = { keyword: "prefixItems", type: "array", schemaType: ["array"], before: "uniqueItems", code: (X) => (0, Aj.validateTuple)(X, "items") };
  OB.default = Mj;
});
var MB = P((AB) => {
  Object.defineProperty(AB, "__esModule", { value: true });
  var wB = p(), Rj = e(), Ij = d0(), Ej = gY(), bj = { message: ({ params: { len: X } }) => wB.str`must NOT have more than ${X} items`, params: ({ params: { len: X } }) => wB._`{limit: ${X}}` }, Pj = { keyword: "items", type: "array", schemaType: ["object", "boolean"], before: "uniqueItems", error: bj, code(X) {
    let { schema: Q, parentSchema: $, it: Y } = X, { prefixItems: W } = $;
    if (Y.items = true, (0, Rj.alwaysValidSchema)(Y, Q)) return;
    if (W) (0, Ej.validateAdditionalItems)(X, W);
    else X.ok((0, Ij.validateArray)(X));
  } };
  AB.default = Pj;
});
var RB = P((jB) => {
  Object.defineProperty(jB, "__esModule", { value: true });
  var i0 = p(), r8 = e(), Zj = { message: ({ params: { min: X, max: Q } }) => Q === void 0 ? i0.str`must contain at least ${X} valid item(s)` : i0.str`must contain at least ${X} and no more than ${Q} valid item(s)`, params: ({ params: { min: X, max: Q } }) => Q === void 0 ? i0._`{minContains: ${X}}` : i0._`{minContains: ${X}, maxContains: ${Q}}` }, Cj = { keyword: "contains", type: "array", schemaType: ["object", "boolean"], before: "uniqueItems", trackErrors: true, error: Zj, code(X) {
    let { gen: Q, schema: $, parentSchema: Y, data: W, it: J } = X, G, H, { minContains: B, maxContains: z } = Y;
    if (J.opts.next) G = B === void 0 ? 1 : B, H = z;
    else G = 1;
    let K = Q.const("len", i0._`${W}.length`);
    if (X.setParams({ min: G, max: H }), H === void 0 && G === 0) {
      (0, r8.checkStrictMode)(J, '"minContains" == 0 without "maxContains": "contains" keyword ignored');
      return;
    }
    if (H !== void 0 && G > H) {
      (0, r8.checkStrictMode)(J, '"minContains" > "maxContains" is always invalid'), X.fail();
      return;
    }
    if ((0, r8.alwaysValidSchema)(J, $)) {
      let q = i0._`${K} >= ${G}`;
      if (H !== void 0) q = i0._`${q} && ${K} <= ${H}`;
      X.pass(q);
      return;
    }
    J.items = true;
    let V = Q.name("valid");
    if (H === void 0 && G === 1) U(V, () => Q.if(V, () => Q.break()));
    else if (G === 0) {
      if (Q.let(V, true), H !== void 0) Q.if(i0._`${W}.length > 0`, L);
    } else Q.let(V, false), L();
    X.result(V, () => X.reset());
    function L() {
      let q = Q.name("_valid"), N = Q.let("count", 0);
      U(q, () => Q.if(q, () => F(N)));
    }
    function U(q, N) {
      Q.forRange("i", 0, K, (w) => {
        X.subschema({ keyword: "contains", dataProp: w, dataPropType: r8.Type.Num, compositeRule: true }, q), N();
      });
    }
    function F(q) {
      if (Q.code(i0._`${q}++`), H === void 0) Q.if(i0._`${q} >= ${G}`, () => Q.assign(V, true).break());
      else if (Q.if(i0._`${q} > ${H}`, () => Q.assign(V, false).break()), G === 1) Q.assign(V, true);
      else Q.if(i0._`${q} >= ${G}`, () => Q.assign(V, true));
    }
  } };
  jB.default = Cj;
});
var ZB = P((bB) => {
  Object.defineProperty(bB, "__esModule", { value: true });
  bB.validateSchemaDeps = bB.validatePropertyDeps = bB.error = void 0;
  var hY = p(), vj = e(), Y4 = d0();
  bB.error = { message: ({ params: { property: X, depsCount: Q, deps: $ } }) => {
    let Y = Q === 1 ? "property" : "properties";
    return hY.str`must have ${Y} ${$} when property ${X} is present`;
  }, params: ({ params: { property: X, depsCount: Q, deps: $, missingProperty: Y } }) => hY._`{property: ${X},
    missingProperty: ${Y},
    depsCount: ${Q},
    deps: ${$}}` };
  var Tj = { keyword: "dependencies", type: "object", schemaType: "object", error: bB.error, code(X) {
    let [Q, $] = _j(X);
    IB(X, Q), EB(X, $);
  } };
  function _j({ schema: X }) {
    let Q = {}, $ = {};
    for (let Y in X) {
      if (Y === "__proto__") continue;
      let W = Array.isArray(X[Y]) ? Q : $;
      W[Y] = X[Y];
    }
    return [Q, $];
  }
  function IB(X, Q = X.schema) {
    let { gen: $, data: Y, it: W } = X;
    if (Object.keys(Q).length === 0) return;
    let J = $.let("missing");
    for (let G in Q) {
      let H = Q[G];
      if (H.length === 0) continue;
      let B = (0, Y4.propertyInData)($, Y, G, W.opts.ownProperties);
      if (X.setParams({ property: G, depsCount: H.length, deps: H.join(", ") }), W.allErrors) $.if(B, () => {
        for (let z of H) (0, Y4.checkReportMissingProp)(X, z);
      });
      else $.if(hY._`${B} && (${(0, Y4.checkMissingProp)(X, H, J)})`), (0, Y4.reportMissingProp)(X, J), $.else();
    }
  }
  bB.validatePropertyDeps = IB;
  function EB(X, Q = X.schema) {
    let { gen: $, data: Y, keyword: W, it: J } = X, G = $.name("valid");
    for (let H in Q) {
      if ((0, vj.alwaysValidSchema)(J, Q[H])) continue;
      $.if((0, Y4.propertyInData)($, Y, H, J.opts.ownProperties), () => {
        let B = X.subschema({ keyword: W, schemaProp: H }, G);
        X.mergeValidEvaluated(B, G);
      }, () => $.var(G, true)), X.ok(G);
    }
  }
  bB.validateSchemaDeps = EB;
  bB.default = Tj;
});
var vB = P((kB) => {
  Object.defineProperty(kB, "__esModule", { value: true });
  var CB = p(), gj = e(), fj = { message: "property name must be valid", params: ({ params: X }) => CB._`{propertyName: ${X.propertyName}}` }, hj = { keyword: "propertyNames", type: "object", schemaType: ["object", "boolean"], error: fj, code(X) {
    let { gen: Q, schema: $, data: Y, it: W } = X;
    if ((0, gj.alwaysValidSchema)(W, $)) return;
    let J = Q.name("valid");
    Q.forIn("key", Y, (G) => {
      X.setParams({ propertyName: G }), X.subschema({ keyword: "propertyNames", data: G, dataTypes: ["string"], propertyName: G, compositeRule: true }, J), Q.if((0, CB.not)(J), () => {
        if (X.error(true), !W.allErrors) Q.break();
      });
    }), X.ok(J);
  } };
  kB.default = hj;
});
var uY = P((TB) => {
  Object.defineProperty(TB, "__esModule", { value: true });
  var o8 = d0(), $1 = p(), lj = R1(), t8 = e(), mj = { message: "must NOT have additional properties", params: ({ params: X }) => $1._`{additionalProperty: ${X.additionalProperty}}` }, cj = { keyword: "additionalProperties", type: ["object"], schemaType: ["boolean", "object"], allowUndefined: true, trackErrors: true, error: mj, code(X) {
    let { gen: Q, schema: $, parentSchema: Y, data: W, errsCount: J, it: G } = X;
    if (!J) throw Error("ajv implementation error");
    let { allErrors: H, opts: B } = G;
    if (G.props = true, B.removeAdditional !== "all" && (0, t8.alwaysValidSchema)(G, $)) return;
    let z = (0, o8.allSchemaProperties)(Y.properties), K = (0, o8.allSchemaProperties)(Y.patternProperties);
    V(), X.ok($1._`${J} === ${lj.default.errors}`);
    function V() {
      Q.forIn("key", W, (N) => {
        if (!z.length && !K.length) F(N);
        else Q.if(L(N), () => F(N));
      });
    }
    function L(N) {
      let w;
      if (z.length > 8) {
        let M = (0, t8.schemaRefOrVal)(G, Y.properties, "properties");
        w = (0, o8.isOwnProperty)(Q, M, N);
      } else if (z.length) w = (0, $1.or)(...z.map((M) => $1._`${N} === ${M}`));
      else w = $1.nil;
      if (K.length) w = (0, $1.or)(w, ...K.map((M) => $1._`${(0, o8.usePattern)(X, M)}.test(${N})`));
      return (0, $1.not)(w);
    }
    function U(N) {
      Q.code($1._`delete ${W}[${N}]`);
    }
    function F(N) {
      if (B.removeAdditional === "all" || B.removeAdditional && $ === false) {
        U(N);
        return;
      }
      if ($ === false) {
        if (X.setParams({ additionalProperty: N }), X.error(), !H) Q.break();
        return;
      }
      if (typeof $ == "object" && !(0, t8.alwaysValidSchema)(G, $)) {
        let w = Q.name("valid");
        if (B.removeAdditional === "failing") q(N, w, false), Q.if((0, $1.not)(w), () => {
          X.reset(), U(N);
        });
        else if (q(N, w), !H) Q.if((0, $1.not)(w), () => Q.break());
      }
    }
    function q(N, w, M) {
      let R = { keyword: "additionalProperties", dataProp: N, dataPropType: t8.Type.Str };
      if (M === false) Object.assign(R, { compositeRule: true, createErrors: false, allErrors: false });
      X.subschema(R, w);
    }
  } };
  TB.default = cj;
});
var gB = P((yB) => {
  Object.defineProperty(yB, "__esModule", { value: true });
  var dj = dX(), _B = d0(), lY = e(), xB = uY(), ij = { keyword: "properties", type: "object", schemaType: "object", code(X) {
    let { gen: Q, schema: $, parentSchema: Y, data: W, it: J } = X;
    if (J.opts.removeAdditional === "all" && Y.additionalProperties === void 0) xB.default.code(new dj.KeywordCxt(J, xB.default, "additionalProperties"));
    let G = (0, _B.allSchemaProperties)($);
    for (let V of G) J.definedProperties.add(V);
    if (J.opts.unevaluated && G.length && J.props !== true) J.props = lY.mergeEvaluated.props(Q, (0, lY.toHash)(G), J.props);
    let H = G.filter((V) => !(0, lY.alwaysValidSchema)(J, $[V]));
    if (H.length === 0) return;
    let B = Q.name("valid");
    for (let V of H) {
      if (z(V)) K(V);
      else {
        if (Q.if((0, _B.propertyInData)(Q, W, V, J.opts.ownProperties)), K(V), !J.allErrors) Q.else().var(B, true);
        Q.endIf();
      }
      X.it.definedProperties.add(V), X.ok(B);
    }
    function z(V) {
      return J.opts.useDefaults && !J.compositeRule && $[V].default !== void 0;
    }
    function K(V) {
      X.subschema({ keyword: "properties", schemaProp: V, dataProp: V }, B);
    }
  } };
  yB.default = ij;
});
var mB = P((lB) => {
  Object.defineProperty(lB, "__esModule", { value: true });
  var fB = d0(), a8 = p(), hB = e(), uB = e(), rj = { keyword: "patternProperties", type: "object", schemaType: "object", code(X) {
    let { gen: Q, schema: $, data: Y, parentSchema: W, it: J } = X, { opts: G } = J, H = (0, fB.allSchemaProperties)($), B = H.filter((q) => (0, hB.alwaysValidSchema)(J, $[q]));
    if (H.length === 0 || B.length === H.length && (!J.opts.unevaluated || J.props === true)) return;
    let z = G.strictSchema && !G.allowMatchingProperties && W.properties, K = Q.name("valid");
    if (J.props !== true && !(J.props instanceof a8.Name)) J.props = (0, uB.evaluatedPropsToName)(Q, J.props);
    let { props: V } = J;
    L();
    function L() {
      for (let q of H) {
        if (z) U(q);
        if (J.allErrors) F(q);
        else Q.var(K, true), F(q), Q.if(K);
      }
    }
    function U(q) {
      for (let N in z) if (new RegExp(q).test(N)) (0, hB.checkStrictMode)(J, `property ${N} matches pattern ${q} (use allowMatchingProperties)`);
    }
    function F(q) {
      Q.forIn("key", Y, (N) => {
        Q.if(a8._`${(0, fB.usePattern)(X, q)}.test(${N})`, () => {
          let w = B.includes(q);
          if (!w) X.subschema({ keyword: "patternProperties", schemaProp: q, dataProp: N, dataPropType: uB.Type.Str }, K);
          if (J.opts.unevaluated && V !== true) Q.assign(a8._`${V}[${N}]`, true);
          else if (!w && !J.allErrors) Q.if((0, a8.not)(K), () => Q.break());
        });
      });
    }
  } };
  lB.default = rj;
});
var pB = P((cB) => {
  Object.defineProperty(cB, "__esModule", { value: true });
  var tj = e(), aj = { keyword: "not", schemaType: ["object", "boolean"], trackErrors: true, code(X) {
    let { gen: Q, schema: $, it: Y } = X;
    if ((0, tj.alwaysValidSchema)(Y, $)) {
      X.fail();
      return;
    }
    let W = Q.name("valid");
    X.subschema({ keyword: "not", compositeRule: true, createErrors: false, allErrors: false }, W), X.failResult(W, () => X.reset(), () => X.error());
  }, error: { message: "must NOT be valid" } };
  cB.default = aj;
});
var iB = P((dB) => {
  Object.defineProperty(dB, "__esModule", { value: true });
  var ej = d0(), XR = { keyword: "anyOf", schemaType: "array", trackErrors: true, code: ej.validateUnion, error: { message: "must match a schema in anyOf" } };
  dB.default = XR;
});
var rB = P((nB) => {
  Object.defineProperty(nB, "__esModule", { value: true });
  var s8 = p(), $R = e(), YR = { message: "must match exactly one schema in oneOf", params: ({ params: X }) => s8._`{passingSchemas: ${X.passing}}` }, WR = { keyword: "oneOf", schemaType: "array", trackErrors: true, error: YR, code(X) {
    let { gen: Q, schema: $, parentSchema: Y, it: W } = X;
    if (!Array.isArray($)) throw Error("ajv implementation error");
    if (W.opts.discriminator && Y.discriminator) return;
    let J = $, G = Q.let("valid", false), H = Q.let("passing", null), B = Q.name("_valid");
    X.setParams({ passing: H }), Q.block(z), X.result(G, () => X.reset(), () => X.error(true));
    function z() {
      J.forEach((K, V) => {
        let L;
        if ((0, $R.alwaysValidSchema)(W, K)) Q.var(B, true);
        else L = X.subschema({ keyword: "oneOf", schemaProp: V, compositeRule: true }, B);
        if (V > 0) Q.if(s8._`${B} && ${G}`).assign(G, false).assign(H, s8._`[${H}, ${V}]`).else();
        Q.if(B, () => {
          if (Q.assign(G, true), Q.assign(H, V), L) X.mergeEvaluated(L, s8.Name);
        });
      });
    }
  } };
  nB.default = WR;
});
var tB = P((oB) => {
  Object.defineProperty(oB, "__esModule", { value: true });
  var GR = e(), HR = { keyword: "allOf", schemaType: "array", code(X) {
    let { gen: Q, schema: $, it: Y } = X;
    if (!Array.isArray($)) throw Error("ajv implementation error");
    let W = Q.name("valid");
    $.forEach((J, G) => {
      if ((0, GR.alwaysValidSchema)(Y, J)) return;
      let H = X.subschema({ keyword: "allOf", schemaProp: G }, W);
      X.ok(W), X.mergeEvaluated(H);
    });
  } };
  oB.default = HR;
});
var Xz = P((eB) => {
  Object.defineProperty(eB, "__esModule", { value: true });
  var e8 = p(), sB = e(), zR = { message: ({ params: X }) => e8.str`must match "${X.ifClause}" schema`, params: ({ params: X }) => e8._`{failingKeyword: ${X.ifClause}}` }, KR = { keyword: "if", schemaType: ["object", "boolean"], trackErrors: true, error: zR, code(X) {
    let { gen: Q, parentSchema: $, it: Y } = X;
    if ($.then === void 0 && $.else === void 0) (0, sB.checkStrictMode)(Y, '"if" without "then" and "else" is ignored');
    let W = aB(Y, "then"), J = aB(Y, "else");
    if (!W && !J) return;
    let G = Q.let("valid", true), H = Q.name("_valid");
    if (B(), X.reset(), W && J) {
      let K = Q.let("ifClause");
      X.setParams({ ifClause: K }), Q.if(H, z("then", K), z("else", K));
    } else if (W) Q.if(H, z("then"));
    else Q.if((0, e8.not)(H), z("else"));
    X.pass(G, () => X.error(true));
    function B() {
      let K = X.subschema({ keyword: "if", compositeRule: true, createErrors: false, allErrors: false }, H);
      X.mergeEvaluated(K);
    }
    function z(K, V) {
      return () => {
        let L = X.subschema({ keyword: K }, H);
        if (Q.assign(G, H), X.mergeValidEvaluated(L, G), V) Q.assign(V, e8._`${K}`);
        else X.setParams({ ifClause: K });
      };
    }
  } };
  function aB(X, Q) {
    let $ = X.schema[Q];
    return $ !== void 0 && !(0, sB.alwaysValidSchema)(X, $);
  }
  eB.default = KR;
});
var $z = P((Qz) => {
  Object.defineProperty(Qz, "__esModule", { value: true });
  var VR = e(), LR = { keyword: ["then", "else"], schemaType: ["object", "boolean"], code({ keyword: X, parentSchema: Q, it: $ }) {
    if (Q.if === void 0) (0, VR.checkStrictMode)($, `"${X}" without "if" is ignored`);
  } };
  Qz.default = LR;
});
var Wz = P((Yz) => {
  Object.defineProperty(Yz, "__esModule", { value: true });
  var FR = gY(), NR = DB(), OR = fY(), DR = MB(), wR = RB(), AR = ZB(), MR = vB(), jR = uY(), RR = gB(), IR = mB(), ER = pB(), bR = iB(), PR = rB(), SR = tB(), ZR = Xz(), CR = $z();
  function kR(X = false) {
    let Q = [ER.default, bR.default, PR.default, SR.default, ZR.default, CR.default, MR.default, jR.default, AR.default, RR.default, IR.default];
    if (X) Q.push(NR.default, DR.default);
    else Q.push(FR.default, OR.default);
    return Q.push(wR.default), Q;
  }
  Yz.default = kR;
});
var Gz = P((Jz) => {
  Object.defineProperty(Jz, "__esModule", { value: true });
  var L0 = p(), TR = { message: ({ schemaCode: X }) => L0.str`must match format "${X}"`, params: ({ schemaCode: X }) => L0._`{format: ${X}}` }, _R = { keyword: "format", type: ["number", "string"], schemaType: "string", $data: true, error: TR, code(X, Q) {
    let { gen: $, data: Y, $data: W, schema: J, schemaCode: G, it: H } = X, { opts: B, errSchemaPath: z, schemaEnv: K, self: V } = H;
    if (!B.validateFormats) return;
    if (W) L();
    else U();
    function L() {
      let F = $.scopeValue("formats", { ref: V.formats, code: B.code.formats }), q = $.const("fDef", L0._`${F}[${G}]`), N = $.let("fType"), w = $.let("format");
      $.if(L0._`typeof ${q} == "object" && !(${q} instanceof RegExp)`, () => $.assign(N, L0._`${q}.type || "string"`).assign(w, L0._`${q}.validate`), () => $.assign(N, L0._`"string"`).assign(w, q)), X.fail$data((0, L0.or)(M(), R()));
      function M() {
        if (B.strictSchema === false) return L0.nil;
        return L0._`${G} && !${w}`;
      }
      function R() {
        let S = K.$async ? L0._`(${q}.async ? await ${w}(${Y}) : ${w}(${Y}))` : L0._`${w}(${Y})`, C = L0._`(typeof ${w} == "function" ? ${S} : ${w}.test(${Y}))`;
        return L0._`${w} && ${w} !== true && ${N} === ${Q} && !${C}`;
      }
    }
    function U() {
      let F = V.formats[J];
      if (!F) {
        M();
        return;
      }
      if (F === true) return;
      let [q, N, w] = R(F);
      if (q === Q) X.pass(S());
      function M() {
        if (B.strictSchema === false) {
          V.logger.warn(C());
          return;
        }
        throw Error(C());
        function C() {
          return `unknown format "${J}" ignored in schema at path "${z}"`;
        }
      }
      function R(C) {
        let K0 = C instanceof RegExp ? (0, L0.regexpCode)(C) : B.code.formats ? L0._`${B.code.formats}${(0, L0.getProperty)(J)}` : void 0, U0 = $.scopeValue("formats", { key: J, ref: C, code: K0 });
        if (typeof C == "object" && !(C instanceof RegExp)) return [C.type || "string", C.validate, L0._`${U0}.validate`];
        return ["string", C, U0];
      }
      function S() {
        if (typeof F == "object" && !(F instanceof RegExp) && F.async) {
          if (!K.$async) throw Error("async format in sync schema");
          return L0._`await ${w}(${Y})`;
        }
        return typeof N == "function" ? L0._`${w}(${Y})` : L0._`${w}.test(${Y})`;
      }
    }
  } };
  Jz.default = _R;
});
var Bz = P((Hz) => {
  Object.defineProperty(Hz, "__esModule", { value: true });
  var yR = Gz(), gR = [yR.default];
  Hz.default = gR;
});
var Uz = P((zz) => {
  Object.defineProperty(zz, "__esModule", { value: true });
  zz.contentVocabulary = zz.metadataVocabulary = void 0;
  zz.metadataVocabulary = ["title", "description", "default", "deprecated", "readOnly", "writeOnly", "examples"];
  zz.contentVocabulary = ["contentMediaType", "contentEncoding", "contentSchema"];
});
var qz = P((Lz) => {
  Object.defineProperty(Lz, "__esModule", { value: true });
  var uR = yH(), lR = zB(), mR = Wz(), cR = Bz(), Vz = Uz(), pR = [uR.default, lR.default, (0, mR.default)(), cR.default, Vz.metadataVocabulary, Vz.contentVocabulary];
  Lz.default = pR;
});
var Dz = P((Nz) => {
  Object.defineProperty(Nz, "__esModule", { value: true });
  Nz.DiscrError = void 0;
  var Fz;
  (function(X) {
    X.Tag = "tag", X.Mapping = "mapping";
  })(Fz || (Nz.DiscrError = Fz = {}));
});
var Mz = P((Az) => {
  Object.defineProperty(Az, "__esModule", { value: true });
  var n6 = p(), mY = Dz(), wz = x8(), iR = iX(), nR = e(), rR = { message: ({ params: { discrError: X, tagName: Q } }) => X === mY.DiscrError.Tag ? `tag "${Q}" must be string` : `value of tag "${Q}" must be in oneOf`, params: ({ params: { discrError: X, tag: Q, tagName: $ } }) => n6._`{error: ${X}, tag: ${$}, tagValue: ${Q}}` }, oR = { keyword: "discriminator", type: "object", schemaType: "object", error: rR, code(X) {
    let { gen: Q, data: $, schema: Y, parentSchema: W, it: J } = X, { oneOf: G } = W;
    if (!J.opts.discriminator) throw Error("discriminator: requires discriminator option");
    let H = Y.propertyName;
    if (typeof H != "string") throw Error("discriminator: requires propertyName");
    if (Y.mapping) throw Error("discriminator: mapping is not supported");
    if (!G) throw Error("discriminator: requires oneOf keyword");
    let B = Q.let("valid", false), z = Q.const("tag", n6._`${$}${(0, n6.getProperty)(H)}`);
    Q.if(n6._`typeof ${z} == "string"`, () => K(), () => X.error(false, { discrError: mY.DiscrError.Tag, tag: z, tagName: H })), X.ok(B);
    function K() {
      let U = L();
      Q.if(false);
      for (let F in U) Q.elseIf(n6._`${z} === ${F}`), Q.assign(B, V(U[F]));
      Q.else(), X.error(false, { discrError: mY.DiscrError.Mapping, tag: z, tagName: H }), Q.endIf();
    }
    function V(U) {
      let F = Q.name("valid"), q = X.subschema({ keyword: "oneOf", schemaProp: U }, F);
      return X.mergeEvaluated(q, n6.Name), F;
    }
    function L() {
      var U;
      let F = {}, q = w(W), N = true;
      for (let S = 0; S < G.length; S++) {
        let C = G[S];
        if ((C === null || C === void 0 ? void 0 : C.$ref) && !(0, nR.schemaHasRulesButRef)(C, J.self.RULES)) {
          let U0 = C.$ref;
          if (C = wz.resolveRef.call(J.self, J.schemaEnv.root, J.baseId, U0), C instanceof wz.SchemaEnv) C = C.schema;
          if (C === void 0) throw new iR.default(J.opts.uriResolver, J.baseId, U0);
        }
        let K0 = (U = C === null || C === void 0 ? void 0 : C.properties) === null || U === void 0 ? void 0 : U[H];
        if (typeof K0 != "object") throw Error(`discriminator: oneOf subschemas (or referenced schemas) must have "properties/${H}"`);
        N = N && (q || w(C)), M(K0, S);
      }
      if (!N) throw Error(`discriminator: "${H}" must be required`);
      return F;
      function w({ required: S }) {
        return Array.isArray(S) && S.includes(H);
      }
      function M(S, C) {
        if (S.const) R(S.const, C);
        else if (S.enum) for (let K0 of S.enum) R(K0, C);
        else throw Error(`discriminator: "properties/${H}" must have "const" or "enum"`);
      }
      function R(S, C) {
        if (typeof S != "string" || S in F) throw Error(`discriminator: "${H}" values must be unique strings`);
        F[S] = C;
      }
    }
  } };
  Az.default = oR;
});
var jz = P((K_, aR) => {
  aR.exports = { $schema: "http://json-schema.org/draft-07/schema#", $id: "http://json-schema.org/draft-07/schema#", title: "Core schema meta-schema", definitions: { schemaArray: { type: "array", minItems: 1, items: { $ref: "#" } }, nonNegativeInteger: { type: "integer", minimum: 0 }, nonNegativeIntegerDefault0: { allOf: [{ $ref: "#/definitions/nonNegativeInteger" }, { default: 0 }] }, simpleTypes: { enum: ["array", "boolean", "integer", "null", "number", "object", "string"] }, stringArray: { type: "array", items: { type: "string" }, uniqueItems: true, default: [] } }, type: ["object", "boolean"], properties: { $id: { type: "string", format: "uri-reference" }, $schema: { type: "string", format: "uri" }, $ref: { type: "string", format: "uri-reference" }, $comment: { type: "string" }, title: { type: "string" }, description: { type: "string" }, default: true, readOnly: { type: "boolean", default: false }, examples: { type: "array", items: true }, multipleOf: { type: "number", exclusiveMinimum: 0 }, maximum: { type: "number" }, exclusiveMaximum: { type: "number" }, minimum: { type: "number" }, exclusiveMinimum: { type: "number" }, maxLength: { $ref: "#/definitions/nonNegativeInteger" }, minLength: { $ref: "#/definitions/nonNegativeIntegerDefault0" }, pattern: { type: "string", format: "regex" }, additionalItems: { $ref: "#" }, items: { anyOf: [{ $ref: "#" }, { $ref: "#/definitions/schemaArray" }], default: true }, maxItems: { $ref: "#/definitions/nonNegativeInteger" }, minItems: { $ref: "#/definitions/nonNegativeIntegerDefault0" }, uniqueItems: { type: "boolean", default: false }, contains: { $ref: "#" }, maxProperties: { $ref: "#/definitions/nonNegativeInteger" }, minProperties: { $ref: "#/definitions/nonNegativeIntegerDefault0" }, required: { $ref: "#/definitions/stringArray" }, additionalProperties: { $ref: "#" }, definitions: { type: "object", additionalProperties: { $ref: "#" }, default: {} }, properties: { type: "object", additionalProperties: { $ref: "#" }, default: {} }, patternProperties: { type: "object", additionalProperties: { $ref: "#" }, propertyNames: { format: "regex" }, default: {} }, dependencies: { type: "object", additionalProperties: { anyOf: [{ $ref: "#" }, { $ref: "#/definitions/stringArray" }] } }, propertyNames: { $ref: "#" }, const: true, enum: { type: "array", items: true, minItems: 1, uniqueItems: true }, type: { anyOf: [{ $ref: "#/definitions/simpleTypes" }, { type: "array", items: { $ref: "#/definitions/simpleTypes" }, minItems: 1, uniqueItems: true }] }, format: { type: "string" }, contentMediaType: { type: "string" }, contentEncoding: { type: "string" }, if: { $ref: "#" }, then: { $ref: "#" }, else: { $ref: "#" }, allOf: { $ref: "#/definitions/schemaArray" }, anyOf: { $ref: "#/definitions/schemaArray" }, oneOf: { $ref: "#/definitions/schemaArray" }, not: { $ref: "#" } }, default: true };
});
var pY = P((f0, cY) => {
  Object.defineProperty(f0, "__esModule", { value: true });
  f0.MissingRefError = f0.ValidationError = f0.CodeGen = f0.Name = f0.nil = f0.stringify = f0.str = f0._ = f0.KeywordCxt = f0.Ajv = void 0;
  var sR = bH(), eR = qz(), XI = Mz(), Rz = jz(), QI = ["/properties"], X9 = "http://json-schema.org/draft-07/schema";
  class W4 extends sR.default {
    _addVocabularies() {
      if (super._addVocabularies(), eR.default.forEach((X) => this.addVocabulary(X)), this.opts.discriminator) this.addKeyword(XI.default);
    }
    _addDefaultMetaSchema() {
      if (super._addDefaultMetaSchema(), !this.opts.meta) return;
      let X = this.opts.$data ? this.$dataMetaSchema(Rz, QI) : Rz;
      this.addMetaSchema(X, X9, false), this.refs["http://json-schema.org/schema"] = X9;
    }
    defaultMeta() {
      return this.opts.defaultMeta = super.defaultMeta() || (this.getSchema(X9) ? X9 : void 0);
    }
  }
  f0.Ajv = W4;
  cY.exports = f0 = W4;
  cY.exports.Ajv = W4;
  Object.defineProperty(f0, "__esModule", { value: true });
  f0.default = W4;
  var $I = dX();
  Object.defineProperty(f0, "KeywordCxt", { enumerable: true, get: function() {
    return $I.KeywordCxt;
  } });
  var r6 = p();
  Object.defineProperty(f0, "_", { enumerable: true, get: function() {
    return r6._;
  } });
  Object.defineProperty(f0, "str", { enumerable: true, get: function() {
    return r6.str;
  } });
  Object.defineProperty(f0, "stringify", { enumerable: true, get: function() {
    return r6.stringify;
  } });
  Object.defineProperty(f0, "nil", { enumerable: true, get: function() {
    return r6.nil;
  } });
  Object.defineProperty(f0, "Name", { enumerable: true, get: function() {
    return r6.Name;
  } });
  Object.defineProperty(f0, "CodeGen", { enumerable: true, get: function() {
    return r6.CodeGen;
  } });
  var YI = T8();
  Object.defineProperty(f0, "ValidationError", { enumerable: true, get: function() {
    return YI.default;
  } });
  var WI = iX();
  Object.defineProperty(f0, "MissingRefError", { enumerable: true, get: function() {
    return WI.default;
  } });
});
var Tz = P((kz) => {
  Object.defineProperty(kz, "__esModule", { value: true });
  kz.formatNames = kz.fastFormats = kz.fullFormats = void 0;
  function V1(X, Q) {
    return { validate: X, compare: Q };
  }
  kz.fullFormats = { date: V1(Pz, rY), time: V1(iY(true), oY), "date-time": V1(Iz(true), Zz), "iso-time": V1(iY(), Sz), "iso-date-time": V1(Iz(), Cz), duration: /^P(?!$)((\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+S)?)?|(\d+W)?)$/, uri: VI, "uri-reference": /^(?:[a-z][a-z0-9+\-.]*:)?(?:\/?\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:]|%[0-9a-f]{2})*@)?(?:\[(?:(?:(?:(?:[0-9a-f]{1,4}:){6}|::(?:[0-9a-f]{1,4}:){5}|(?:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){4}|(?:(?:[0-9a-f]{1,4}:){0,1}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){3}|(?:(?:[0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){2}|(?:(?:[0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:|(?:(?:[0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::)(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?))|(?:(?:[0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4}|(?:(?:[0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::)|[Vv][0-9a-f]+\.[a-z0-9\-._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)|(?:[a-z0-9\-._~!$&'"()*+,;=]|%[0-9a-f]{2})*)(?::\d*)?(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*|\/(?:(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*)?|(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*)?(?:\?(?:[a-z0-9\-._~!$&'"()*+,;=:@/?]|%[0-9a-f]{2})*)?(?:#(?:[a-z0-9\-._~!$&'"()*+,;=:@/?]|%[0-9a-f]{2})*)?$/i, "uri-template": /^(?:(?:[^\x00-\x20"'<>%\\^`{|}]|%[0-9a-f]{2})|\{[+#./;?&=,!@|]?(?:[a-z0-9_]|%[0-9a-f]{2})+(?::[1-9][0-9]{0,3}|\*)?(?:,(?:[a-z0-9_]|%[0-9a-f]{2})+(?::[1-9][0-9]{0,3}|\*)?)*\})*$/i, url: /^(?:https?|ftp):\/\/(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z0-9\u{00a1}-\u{ffff}]+-)*[a-z0-9\u{00a1}-\u{ffff}]+)(?:\.(?:[a-z0-9\u{00a1}-\u{ffff}]+-)*[a-z0-9\u{00a1}-\u{ffff}]+)*(?:\.(?:[a-z\u{00a1}-\u{ffff}]{2,})))(?::\d{2,5})?(?:\/[^\s]*)?$/iu, email: /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i, hostname: /^(?=.{1,253}\.?$)[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[-0-9a-z]{0,61}[0-9a-z])?)*\.?$/i, ipv4: /^(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)$/, ipv6: /^((([0-9a-f]{1,4}:){7}([0-9a-f]{1,4}|:))|(([0-9a-f]{1,4}:){6}(:[0-9a-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9a-f]{1,4}:){5}(((:[0-9a-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9a-f]{1,4}:){4}(((:[0-9a-f]{1,4}){1,3})|((:[0-9a-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){3}(((:[0-9a-f]{1,4}){1,4})|((:[0-9a-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){2}(((:[0-9a-f]{1,4}){1,5})|((:[0-9a-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){1}(((:[0-9a-f]{1,4}){1,6})|((:[0-9a-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9a-f]{1,4}){1,7})|((:[0-9a-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))$/i, regex: wI, uuid: /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i, "json-pointer": /^(?:\/(?:[^~/]|~0|~1)*)*$/, "json-pointer-uri-fragment": /^#(?:\/(?:[a-z0-9_\-.!$&'()*+,;:=@]|%[0-9a-f]{2}|~0|~1)*)*$/i, "relative-json-pointer": /^(?:0|[1-9][0-9]*)(?:#|(?:\/(?:[^~/]|~0|~1)*)*)$/, byte: LI, int32: { type: "number", validate: NI }, int64: { type: "number", validate: OI }, float: { type: "number", validate: bz }, double: { type: "number", validate: bz }, password: true, binary: true };
  kz.fastFormats = { ...kz.fullFormats, date: V1(/^\d\d\d\d-[0-1]\d-[0-3]\d$/, rY), time: V1(/^(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)$/i, oY), "date-time": V1(/^\d\d\d\d-[0-1]\d-[0-3]\dt(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)$/i, Zz), "iso-time": V1(/^(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)?$/i, Sz), "iso-date-time": V1(/^\d\d\d\d-[0-1]\d-[0-3]\d[t\s](?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)?$/i, Cz), uri: /^(?:[a-z][a-z0-9+\-.]*:)(?:\/?\/)?[^\s]*$/i, "uri-reference": /^(?:(?:[a-z][a-z0-9+\-.]*:)?\/?\/)?(?:[^\\\s#][^\s#]*)?(?:#[^\\\s]*)?$/i, email: /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*$/i };
  kz.formatNames = Object.keys(kz.fullFormats);
  function HI(X) {
    return X % 4 === 0 && (X % 100 !== 0 || X % 400 === 0);
  }
  var BI = /^(\d\d\d\d)-(\d\d)-(\d\d)$/, zI = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  function Pz(X) {
    let Q = BI.exec(X);
    if (!Q) return false;
    let $ = +Q[1], Y = +Q[2], W = +Q[3];
    return Y >= 1 && Y <= 12 && W >= 1 && W <= (Y === 2 && HI($) ? 29 : zI[Y]);
  }
  function rY(X, Q) {
    if (!(X && Q)) return;
    if (X > Q) return 1;
    if (X < Q) return -1;
    return 0;
  }
  var dY = /^(\d\d):(\d\d):(\d\d(?:\.\d+)?)(z|([+-])(\d\d)(?::?(\d\d))?)?$/i;
  function iY(X) {
    return function($) {
      let Y = dY.exec($);
      if (!Y) return false;
      let W = +Y[1], J = +Y[2], G = +Y[3], H = Y[4], B = Y[5] === "-" ? -1 : 1, z = +(Y[6] || 0), K = +(Y[7] || 0);
      if (z > 23 || K > 59 || X && !H) return false;
      if (W <= 23 && J <= 59 && G < 60) return true;
      let V = J - K * B, L = W - z * B - (V < 0 ? 1 : 0);
      return (L === 23 || L === -1) && (V === 59 || V === -1) && G < 61;
    };
  }
  function oY(X, Q) {
    if (!(X && Q)) return;
    let $ = (/* @__PURE__ */ new Date("2020-01-01T" + X)).valueOf(), Y = (/* @__PURE__ */ new Date("2020-01-01T" + Q)).valueOf();
    if (!($ && Y)) return;
    return $ - Y;
  }
  function Sz(X, Q) {
    if (!(X && Q)) return;
    let $ = dY.exec(X), Y = dY.exec(Q);
    if (!($ && Y)) return;
    if (X = $[1] + $[2] + $[3], Q = Y[1] + Y[2] + Y[3], X > Q) return 1;
    if (X < Q) return -1;
    return 0;
  }
  var nY = /t|\s/i;
  function Iz(X) {
    let Q = iY(X);
    return function(Y) {
      let W = Y.split(nY);
      return W.length === 2 && Pz(W[0]) && Q(W[1]);
    };
  }
  function Zz(X, Q) {
    if (!(X && Q)) return;
    let $ = new Date(X).valueOf(), Y = new Date(Q).valueOf();
    if (!($ && Y)) return;
    return $ - Y;
  }
  function Cz(X, Q) {
    if (!(X && Q)) return;
    let [$, Y] = X.split(nY), [W, J] = Q.split(nY), G = rY($, W);
    if (G === void 0) return;
    return G || oY(Y, J);
  }
  var KI = /\/|:/, UI = /^(?:[a-z][a-z0-9+\-.]*:)(?:\/?\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:]|%[0-9a-f]{2})*@)?(?:\[(?:(?:(?:(?:[0-9a-f]{1,4}:){6}|::(?:[0-9a-f]{1,4}:){5}|(?:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){4}|(?:(?:[0-9a-f]{1,4}:){0,1}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){3}|(?:(?:[0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){2}|(?:(?:[0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:|(?:(?:[0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::)(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?))|(?:(?:[0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4}|(?:(?:[0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::)|[Vv][0-9a-f]+\.[a-z0-9\-._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)|(?:[a-z0-9\-._~!$&'()*+,;=]|%[0-9a-f]{2})*)(?::\d*)?(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*|\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)?|(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)(?:\?(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?(?:#(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?$/i;
  function VI(X) {
    return KI.test(X) && UI.test(X);
  }
  var Ez = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/gm;
  function LI(X) {
    return Ez.lastIndex = 0, Ez.test(X);
  }
  var qI = -2147483648, FI = 2147483647;
  function NI(X) {
    return Number.isInteger(X) && X <= FI && X >= qI;
  }
  function OI(X) {
    return Number.isInteger(X);
  }
  function bz() {
    return true;
  }
  var DI = /[^\\]\\Z/;
  function wI(X) {
    if (DI.test(X)) return false;
    try {
      return new RegExp(X), true;
    } catch (Q) {
      return false;
    }
  }
});
var xz = P((_z) => {
  Object.defineProperty(_z, "__esModule", { value: true });
  _z.formatLimitDefinition = void 0;
  var MI = pY(), Y1 = p(), n1 = Y1.operators, Q9 = { formatMaximum: { okStr: "<=", ok: n1.LTE, fail: n1.GT }, formatMinimum: { okStr: ">=", ok: n1.GTE, fail: n1.LT }, formatExclusiveMaximum: { okStr: "<", ok: n1.LT, fail: n1.GTE }, formatExclusiveMinimum: { okStr: ">", ok: n1.GT, fail: n1.LTE } }, jI = { message: ({ keyword: X, schemaCode: Q }) => Y1.str`should be ${Q9[X].okStr} ${Q}`, params: ({ keyword: X, schemaCode: Q }) => Y1._`{comparison: ${Q9[X].okStr}, limit: ${Q}}` };
  _z.formatLimitDefinition = { keyword: Object.keys(Q9), type: "string", schemaType: "string", $data: true, error: jI, code(X) {
    let { gen: Q, data: $, schemaCode: Y, keyword: W, it: J } = X, { opts: G, self: H } = J;
    if (!G.validateFormats) return;
    let B = new MI.KeywordCxt(J, H.RULES.all.format.definition, "format");
    if (B.$data) z();
    else K();
    function z() {
      let L = Q.scopeValue("formats", { ref: H.formats, code: G.code.formats }), U = Q.const("fmt", Y1._`${L}[${B.schemaCode}]`);
      X.fail$data((0, Y1.or)(Y1._`typeof ${U} != "object"`, Y1._`${U} instanceof RegExp`, Y1._`typeof ${U}.compare != "function"`, V(U)));
    }
    function K() {
      let L = B.schema, U = H.formats[L];
      if (!U || U === true) return;
      if (typeof U != "object" || U instanceof RegExp || typeof U.compare != "function") throw Error(`"${W}": format "${L}" does not define "compare" function`);
      let F = Q.scopeValue("formats", { key: L, ref: U, code: G.code.formats ? Y1._`${G.code.formats}${(0, Y1.getProperty)(L)}` : void 0 });
      X.fail$data(V(F));
    }
    function V(L) {
      return Y1._`${L}.compare(${$}, ${Y}) ${Q9[W].fail} 0`;
    }
  }, dependencies: ["format"] };
  var RI = (X) => {
    return X.addKeyword(_z.formatLimitDefinition), X;
  };
  _z.default = RI;
});
var hz = P((J4, fz) => {
  Object.defineProperty(J4, "__esModule", { value: true });
  var o6 = Tz(), EI = xz(), sY = p(), yz = new sY.Name("fullFormats"), bI = new sY.Name("fastFormats"), eY = (X, Q = { keywords: true }) => {
    if (Array.isArray(Q)) return gz(X, Q, o6.fullFormats, yz), X;
    let [$, Y] = Q.mode === "fast" ? [o6.fastFormats, bI] : [o6.fullFormats, yz], W = Q.formats || o6.formatNames;
    if (gz(X, W, $, Y), Q.keywords) (0, EI.default)(X);
    return X;
  };
  eY.get = (X, Q = "full") => {
    let Y = (Q === "fast" ? o6.fastFormats : o6.fullFormats)[X];
    if (!Y) throw Error(`Unknown format "${X}"`);
    return Y;
  };
  function gz(X, Q, $, Y) {
    var W, J;
    (W = (J = X.opts.code).formats) !== null && W !== void 0 || (J.formats = sY._`require("ajv-formats/dist/formats").${Y}`);
    for (let G of Q) X.addFormat(G, $[G]);
  }
  fz.exports = J4 = eY;
  Object.defineProperty(J4, "__esModule", { value: true });
  J4.default = eY;
});
var FK = 50;
function O6(X = FK) {
  let Q = new AbortController();
  return qK(X, Q.signal), Q;
}
var NK = typeof global == "object" && global && global.Object === Object && global;
var F7 = NK;
var OK = typeof self == "object" && self && self.Object === Object && self;
var DK = F7 || OK || Function("return this")();
var D6 = DK;
var wK = D6.Symbol;
var w6 = wK;
var N7 = Object.prototype;
var AK = N7.hasOwnProperty;
var MK = N7.toString;
var s6 = w6 ? w6.toStringTag : void 0;
function jK(X) {
  var Q = AK.call(X, s6), $ = X[s6];
  try {
    X[s6] = void 0;
    var Y = true;
  } catch (J) {
  }
  var W = MK.call(X);
  if (Y) if (Q) X[s6] = $;
  else delete X[s6];
  return W;
}
var O7 = jK;
var RK = Object.prototype;
var IK = RK.toString;
function EK(X) {
  return IK.call(X);
}
var D7 = EK;
var bK = "[object Null]";
var PK = "[object Undefined]";
var w7 = w6 ? w6.toStringTag : void 0;
function SK(X) {
  if (X == null) return X === void 0 ? PK : bK;
  return w7 && w7 in Object(X) ? O7(X) : D7(X);
}
var A7 = SK;
function ZK(X) {
  var Q = typeof X;
  return X != null && (Q == "object" || Q == "function");
}
var K4 = ZK;
var CK = "[object AsyncFunction]";
var kK = "[object Function]";
var vK = "[object GeneratorFunction]";
var TK = "[object Proxy]";
function _K(X) {
  if (!K4(X)) return false;
  var Q = A7(X);
  return Q == kK || Q == vK || Q == CK || Q == TK;
}
var M7 = _K;
var xK = D6["__core-js_shared__"];
var U4 = xK;
var j7 = (function() {
  var X = /[^.]+$/.exec(U4 && U4.keys && U4.keys.IE_PROTO || "");
  return X ? "Symbol(src)_1." + X : "";
})();
function yK(X) {
  return !!j7 && j7 in X;
}
var R7 = yK;
var gK = Function.prototype;
var fK = gK.toString;
function hK(X) {
  if (X != null) {
    try {
      return fK.call(X);
    } catch (Q) {
    }
    try {
      return X + "";
    } catch (Q) {
    }
  }
  return "";
}
var I7 = hK;
var uK = /[\\^$.*+?()[\]{}|]/g;
var lK = /^\[object .+?Constructor\]$/;
var mK = Function.prototype;
var cK = Object.prototype;
var pK = mK.toString;
var dK = cK.hasOwnProperty;
var iK = RegExp("^" + pK.call(dK).replace(uK, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$");
function nK(X) {
  if (!K4(X) || R7(X)) return false;
  var Q = M7(X) ? iK : lK;
  return Q.test(I7(X));
}
var E7 = nK;
function rK(X, Q) {
  return X == null ? void 0 : X[Q];
}
var b7 = rK;
function oK(X, Q) {
  var $ = b7(X, Q);
  return E7($) ? $ : void 0;
}
var V4 = oK;
var tK = V4(Object, "create");
var q1 = tK;
function aK() {
  this.__data__ = q1 ? q1(null) : {}, this.size = 0;
}
var P7 = aK;
function sK(X) {
  var Q = this.has(X) && delete this.__data__[X];
  return this.size -= Q ? 1 : 0, Q;
}
var S7 = sK;
var eK = "__lodash_hash_undefined__";
var XU = Object.prototype;
var QU = XU.hasOwnProperty;
function $U(X) {
  var Q = this.__data__;
  if (q1) {
    var $ = Q[X];
    return $ === eK ? void 0 : $;
  }
  return QU.call(Q, X) ? Q[X] : void 0;
}
var Z7 = $U;
var YU = Object.prototype;
var WU = YU.hasOwnProperty;
function JU(X) {
  var Q = this.__data__;
  return q1 ? Q[X] !== void 0 : WU.call(Q, X);
}
var C7 = JU;
var GU = "__lodash_hash_undefined__";
function HU(X, Q) {
  var $ = this.__data__;
  return this.size += this.has(X) ? 0 : 1, $[X] = q1 && Q === void 0 ? GU : Q, this;
}
var k7 = HU;
function A6(X) {
  var Q = -1, $ = X == null ? 0 : X.length;
  this.clear();
  while (++Q < $) {
    var Y = X[Q];
    this.set(Y[0], Y[1]);
  }
}
A6.prototype.clear = P7;
A6.prototype.delete = S7;
A6.prototype.get = Z7;
A6.prototype.has = C7;
A6.prototype.set = k7;
var J9 = A6;
function BU() {
  this.__data__ = [], this.size = 0;
}
var v7 = BU;
function zU(X, Q) {
  return X === Q || X !== X && Q !== Q;
}
var T7 = zU;
function KU(X, Q) {
  var $ = X.length;
  while ($--) if (T7(X[$][0], Q)) return $;
  return -1;
}
var Z1 = KU;
var UU = Array.prototype;
var VU = UU.splice;
function LU(X) {
  var Q = this.__data__, $ = Z1(Q, X);
  if ($ < 0) return false;
  var Y = Q.length - 1;
  if ($ == Y) Q.pop();
  else VU.call(Q, $, 1);
  return --this.size, true;
}
var _7 = LU;
function qU(X) {
  var Q = this.__data__, $ = Z1(Q, X);
  return $ < 0 ? void 0 : Q[$][1];
}
var x7 = qU;
function FU(X) {
  return Z1(this.__data__, X) > -1;
}
var y7 = FU;
function NU(X, Q) {
  var $ = this.__data__, Y = Z1($, X);
  if (Y < 0) ++this.size, $.push([X, Q]);
  else $[Y][1] = Q;
  return this;
}
var g7 = NU;
function M6(X) {
  var Q = -1, $ = X == null ? 0 : X.length;
  this.clear();
  while (++Q < $) {
    var Y = X[Q];
    this.set(Y[0], Y[1]);
  }
}
M6.prototype.clear = v7;
M6.prototype.delete = _7;
M6.prototype.get = x7;
M6.prototype.has = y7;
M6.prototype.set = g7;
var f7 = M6;
var OU = V4(D6, "Map");
var h7 = OU;
function DU() {
  this.size = 0, this.__data__ = { hash: new J9(), map: new (h7 || f7)(), string: new J9() };
}
var u7 = DU;
function wU(X) {
  var Q = typeof X;
  return Q == "string" || Q == "number" || Q == "symbol" || Q == "boolean" ? X !== "__proto__" : X === null;
}
var l7 = wU;
function AU(X, Q) {
  var $ = X.__data__;
  return l7(Q) ? $[typeof Q == "string" ? "string" : "hash"] : $.map;
}
var C1 = AU;
function MU(X) {
  var Q = C1(this, X).delete(X);
  return this.size -= Q ? 1 : 0, Q;
}
var m7 = MU;
function jU(X) {
  return C1(this, X).get(X);
}
var c7 = jU;
function RU(X) {
  return C1(this, X).has(X);
}
var p7 = RU;
function IU(X, Q) {
  var $ = C1(this, X), Y = $.size;
  return $.set(X, Q), this.size += $.size == Y ? 0 : 1, this;
}
var d7 = IU;
function j6(X) {
  var Q = -1, $ = X == null ? 0 : X.length;
  this.clear();
  while (++Q < $) {
    var Y = X[Q];
    this.set(Y[0], Y[1]);
  }
}
j6.prototype.clear = u7;
j6.prototype.delete = m7;
j6.prototype.get = c7;
j6.prototype.has = p7;
j6.prototype.set = d7;
var G9 = j6;
var EU = "Expected a function";
function H9(X, Q) {
  if (typeof X != "function" || Q != null && typeof Q != "function") throw TypeError(EU);
  var $ = function() {
    var Y = arguments, W = Q ? Q.apply(this, Y) : Y[0], J = $.cache;
    if (J.has(W)) return J.get(W);
    var G = X.apply(this, Y);
    return $.cache = J.set(W, G) || J, G;
  };
  return $.cache = new (H9.Cache || G9)(), $;
}
H9.Cache = G9;
var k1 = H9;
function bU(X, Q) {
  if (X.destroyed) return;
  X.write(Q);
}
function i7(X) {
  bU(process.stderr, X);
}
var n7 = k1((X) => {
  if (!X || X.trim() === "") return null;
  let Q = X.split(",").map((J) => J.trim()).filter(Boolean);
  if (Q.length === 0) return null;
  let $ = Q.some((J) => J.startsWith("!")), Y = Q.some((J) => !J.startsWith("!"));
  if ($ && Y) return null;
  let W = Q.map((J) => J.replace(/^!/, "").toLowerCase());
  return { include: $ ? [] : W, exclude: $ ? W : [], isExclusive: $ };
});
function PU(X) {
  let Q = [], $ = X.match(/^MCP server ["']([^"']+)["']/);
  if ($ && $[1]) Q.push("mcp"), Q.push($[1].toLowerCase());
  else {
    let J = X.match(/^([^:[]+):/);
    if (J && J[1]) Q.push(J[1].trim().toLowerCase());
  }
  let Y = X.match(/^\[([^\]]+)]/);
  if (Y && Y[1]) Q.push(Y[1].trim().toLowerCase());
  if (X.toLowerCase().includes("1p event:")) Q.push("1p");
  let W = X.match(/:\s*([^:]+?)(?:\s+(?:type|mode|status|event))?:/);
  if (W && W[1]) {
    let J = W[1].trim().toLowerCase();
    if (J.length < 30 && !J.includes(" ")) Q.push(J);
  }
  return Array.from(new Set(Q));
}
function SU(X, Q) {
  if (!Q) return true;
  if (X.length === 0) return false;
  if (Q.isExclusive) return !X.some(($) => Q.exclude.includes($));
  else return X.some(($) => Q.include.includes($));
}
function r7(X, Q) {
  if (!Q) return true;
  let $ = PU(X);
  return SU($, Q);
}
function L4() {
  return (process.env.CLAUDE_CONFIG_DIR ?? ZU(CU(), ".claude")).normalize("NFC");
}
function B9(X) {
  if (!X) return false;
  if (typeof X === "boolean") return X;
  let Q = X.toLowerCase().trim();
  return ["1", "true", "yes", "on"].includes(Q);
}
function o7(X) {
  return { name: X, default: 3e4, validate: (Q) => {
    if (!Q) return { effective: 3e4, status: "valid" };
    let $ = parseInt(Q, 10);
    if (isNaN($) || $ <= 0) return { effective: 3e4, status: "invalid", message: `Invalid value "${Q}" (using default: 30000)` };
    if ($ > 15e4) return { effective: 15e4, status: "capped", message: `Capped from ${$} to 150000` };
    return { effective: $, status: "valid" };
  } };
}
var t7 = o7("BASH_MAX_OUTPUT_LENGTH");
var Cb = o7("TASK_MAX_OUTPUT_LENGTH");
var a7 = { name: "CLAUDE_CODE_MAX_OUTPUT_TOKENS", default: 32e3, validate: (X) => {
  if (!X) return { effective: 32e3, status: "valid" };
  let Y = parseInt(X, 10);
  if (isNaN(Y) || Y <= 0) return { effective: 32e3, status: "invalid", message: `Invalid value "${X}" (using default: 32000)` };
  if (Y > 64e3) return { effective: 64e3, status: "capped", message: `Capped from ${Y} to 64000` };
  return { effective: Y, status: "valid" };
} };
function TU() {
  let X = "";
  if (typeof process < "u" && typeof process.cwd === "function" && typeof s7 === "function") X = s7(kU()).normalize("NFC");
  return { originalCwd: X, projectRoot: X, totalCostUSD: 0, totalAPIDuration: 0, totalAPIDurationWithoutRetries: 0, totalToolDuration: 0, startTime: Date.now(), lastInteractionTime: Date.now(), totalLinesAdded: 0, totalLinesRemoved: 0, hasUnknownModelCost: false, cwd: X, modelUsage: {}, mainLoopModelOverride: void 0, initialMainLoopModel: null, modelStrings: null, isInteractive: false, clientType: "cli", sessionIngressToken: void 0, oauthTokenFromFd: void 0, apiKeyFromFd: void 0, flagSettingsPath: void 0, allowedSettingSources: ["userSettings", "projectSettings", "localSettings", "flagSettings", "policySettings"], meter: null, sessionCounter: null, locCounter: null, prCounter: null, commitCounter: null, costCounter: null, tokenCounter: null, codeEditToolDecisionCounter: null, activeTimeCounter: null, sessionId: vU(), parentSessionId: void 0, loggerProvider: null, eventLogger: null, meterProvider: null, tracerProvider: null, agentColorMap: /* @__PURE__ */ new Map(), agentColorIndex: 0, envVarValidators: [t7, a7], lastAPIRequest: null, inMemoryErrorLog: [], inlinePlugins: [], useCoworkPlugins: false, sessionBypassPermissionsMode: false, sessionTrustAccepted: false, sessionPersistenceDisabled: false, hasExitedPlanMode: false, needsPlanModeExitAttachment: false, hasExitedDelegateMode: false, needsDelegateModeExitAttachment: false, lspRecommendationShownThisSession: false, initJsonSchema: null, registeredHooks: null, planSlugCache: /* @__PURE__ */ new Map(), teleportedSessionInfo: null, invokedSkills: /* @__PURE__ */ new Map(), slowOperations: [], promptCacheBreaks: [], sdkBetas: void 0, mainThreadAgentType: void 0, isRemoteMode: false, directConnectServerUrl: void 0, systemPromptSectionCache: /* @__PURE__ */ new Map(), additionalDirectoriesForClaudeMd: [], resumedTranscriptPath: null };
}
var _U = TU();
function e7() {
  return _U.sessionId;
}
function XW({ writeFn: X, flushIntervalMs: Q = 1e3, maxBufferSize: $ = 100, immediateMode: Y = false }) {
  let W = [], J = null;
  function G() {
    if (J) clearTimeout(J), J = null;
  }
  function H() {
    if (W.length === 0) return;
    X(W.join("")), W = [], G();
  }
  function B() {
    if (!J) J = setTimeout(H, Q);
  }
  return { write(z) {
    if (Y) {
      X(z);
      return;
    }
    if (W.push(z), B(), W.length >= $) H();
  }, flush: H, dispose() {
    H();
  } };
}
var QW = /* @__PURE__ */ new Set();
function $W(X) {
  return QW.add(X), () => QW.delete(X);
}
var z9 = (() => {
  let X = process.env.CLAUDE_CODE_SLOW_OPERATION_THRESHOLD_MS;
  if (X !== void 0) {
    let Q = Number(X);
    if (!Number.isNaN(Q) && Q >= 0) return Q;
  }
  return 1 / 0;
})();
function xU(X) {
  if (X === null) return "null";
  if (X === void 0) return "undefined";
  if (Array.isArray(X)) return `Array[${X.length}]`;
  if (typeof X === "object") return `Object{${Object.keys(X).length} keys}`;
  if (typeof X === "string") return `string(${X.length} chars)`;
  return typeof X;
}
function YW(X, Q) {
  let $ = performance.now();
  try {
    return Q();
  } finally {
    performance.now() - $ > z9;
  }
}
function Z0(X, Q, $) {
  let Y = xU(X);
  return YW(`JSON.stringify(${Y})`, () => JSON.stringify(X, Q, $));
}
var q4 = (X, Q) => {
  let $ = typeof X === "string" ? X.length : 0;
  return YW(`JSON.parse(${$} chars)`, () => JSON.parse(X, Q));
};
var yU = k1(() => {
  return B9(process.env.DEBUG) || B9(process.env.DEBUG_SDK) || process.argv.includes("--debug") || process.argv.includes("-d") || JW() || process.argv.some((X) => X.startsWith("--debug=")) || GW() !== null;
});
var gU = k1(() => {
  let X = process.argv.find(($) => $.startsWith("--debug="));
  if (!X) return null;
  let Q = X.substring(8);
  return n7(Q);
});
var JW = k1(() => {
  return process.argv.includes("--debug-to-stderr") || process.argv.includes("-d2e");
});
var GW = k1(() => {
  for (let X = 0; X < process.argv.length; X++) {
    let Q = process.argv[X];
    if (Q.startsWith("--debug-file=")) return Q.substring(13);
    if (Q === "--debug-file" && X + 1 < process.argv.length) return process.argv[X + 1];
  }
  return null;
});
function fU(X) {
  if (typeof process > "u" || typeof process.versions > "u" || typeof process.versions.node > "u") return false;
  let Q = gU();
  return r7(X, Q);
}
var hU = false;
var F4 = null;
function uU() {
  if (!F4) F4 = XW({ writeFn: (X) => {
    let Q = HW();
    if (!n0().existsSync(K9(Q))) n0().mkdirSync(K9(Q));
    n0().appendFileSync(Q, X), lU();
  }, flushIntervalMs: 1e3, maxBufferSize: 100, immediateMode: yU() }), $W(async () => F4?.dispose());
  return F4;
}
function v1(X, { level: Q } = { level: "debug" }) {
  if (!fU(X)) return;
  if (hU && X.includes(`
`)) X = Z0(X);
  let Y = `${(/* @__PURE__ */ new Date()).toISOString()} [${Q.toUpperCase()}] ${X.trim()}
`;
  if (JW()) {
    i7(Y);
    return;
  }
  uU().write(Y);
}
function HW() {
  return GW() ?? process.env.CLAUDE_CODE_DEBUG_LOGS_DIR ?? WW(L4(), "debug", `${e7()}.txt`);
}
var lU = k1(() => {
  if (process.argv[2] === "--ripgrep") return;
  try {
    let X = HW(), Q = K9(X), $ = WW(Q, "latest");
    if (!n0().existsSync(Q)) n0().mkdirSync(Q);
    if (n0().existsSync($)) try {
      n0().unlinkSync($);
    } catch {
    }
    n0().symlinkSync(X, $);
  } catch {
  }
});
function F0(X, Q) {
  let $ = performance.now();
  try {
    return Q();
  } finally {
    performance.now() - $ > z9;
  }
}
var rU = { cwd() {
  return process.cwd();
}, existsSync(X) {
  return F0(`existsSync(${X})`, () => h.existsSync(X));
}, async stat(X) {
  return mU(X);
}, async readdir(X) {
  return cU(X, { withFileTypes: true });
}, async unlink(X) {
  return pU(X);
}, async rmdir(X) {
  return dU(X);
}, async rm(X, Q) {
  return iU(X, Q);
}, statSync(X) {
  return F0(`statSync(${X})`, () => h.statSync(X));
}, lstatSync(X) {
  return F0(`lstatSync(${X})`, () => h.lstatSync(X));
}, readFileSync(X, Q) {
  return F0(`readFileSync(${X})`, () => h.readFileSync(X, { encoding: Q.encoding }));
}, readFileBytesSync(X) {
  return F0(`readFileBytesSync(${X})`, () => h.readFileSync(X));
}, readSync(X, Q) {
  return F0(`readSync(${X}, ${Q.length} bytes)`, () => {
    let $ = void 0;
    try {
      $ = h.openSync(X, "r");
      let Y = Buffer.alloc(Q.length), W = h.readSync($, Y, 0, Q.length, 0);
      return { buffer: Y, bytesRead: W };
    } finally {
      if ($) h.closeSync($);
    }
  });
}, appendFileSync(X, Q, $) {
  return F0(`appendFileSync(${X}, ${Q.length} chars)`, () => {
    if (!h.existsSync(X) && $?.mode !== void 0) {
      let Y = h.openSync(X, "a", $.mode);
      try {
        h.appendFileSync(Y, Q);
      } finally {
        h.closeSync(Y);
      }
    } else h.appendFileSync(X, Q);
  });
}, copyFileSync(X, Q) {
  return F0(`copyFileSync(${X} \u2192 ${Q})`, () => h.copyFileSync(X, Q));
}, unlinkSync(X) {
  return F0(`unlinkSync(${X})`, () => h.unlinkSync(X));
}, renameSync(X, Q) {
  return F0(`renameSync(${X} \u2192 ${Q})`, () => h.renameSync(X, Q));
}, linkSync(X, Q) {
  return F0(`linkSync(${X} \u2192 ${Q})`, () => h.linkSync(X, Q));
}, symlinkSync(X, Q, $) {
  return F0(`symlinkSync(${X} \u2192 ${Q})`, () => h.symlinkSync(X, Q, $));
}, readlinkSync(X) {
  return F0(`readlinkSync(${X})`, () => h.readlinkSync(X));
}, realpathSync(X) {
  return F0(`realpathSync(${X})`, () => h.realpathSync(X).normalize("NFC"));
}, mkdirSync(X, Q) {
  return F0(`mkdirSync(${X})`, () => {
    if (!h.existsSync(X)) {
      let $ = { recursive: true };
      if (Q?.mode !== void 0) $.mode = Q.mode;
      h.mkdirSync(X, $);
    }
  });
}, readdirSync(X) {
  return F0(`readdirSync(${X})`, () => h.readdirSync(X, { withFileTypes: true }));
}, readdirStringSync(X) {
  return F0(`readdirStringSync(${X})`, () => h.readdirSync(X));
}, isDirEmptySync(X) {
  return F0(`isDirEmptySync(${X})`, () => {
    return this.readdirSync(X).length === 0;
  });
}, rmdirSync(X) {
  return F0(`rmdirSync(${X})`, () => h.rmdirSync(X));
}, rmSync(X, Q) {
  return F0(`rmSync(${X})`, () => h.rmSync(X, Q));
}, createWriteStream(X) {
  return h.createWriteStream(X);
} };
var oU = rU;
function n0() {
  return oU;
}
var F1 = class extends Error {
};
function R6() {
  return process.versions.bun !== void 0;
}
var N4 = null;
var zW = false;
function $V() {
  if (zW) return N4;
  if (zW = true, !process.env.DEBUG_CLAUDE_AGENT_SDK) return null;
  let X = BW(L4(), "debug");
  if (N4 = BW(X, `sdk-${sU()}.txt`), !XV(X)) QV(X, { recursive: true });
  return process.stderr.write(`SDK debug logs: ${N4}
`), N4;
}
function N1(X) {
  let Q = $V();
  if (!Q) return;
  let Y = `${(/* @__PURE__ */ new Date()).toISOString()} ${X}
`;
  eU(Q, Y);
}
function KW(X, Q) {
  let $ = { ...X };
  if (Q) {
    let Y = { sandbox: Q };
    if ($.settings) try {
      Y = { ...q4($.settings), sandbox: Q };
    } catch {
    }
    $.settings = Z0(Y);
  }
  return $;
}
var e6 = class {
  options;
  process;
  processStdin;
  processStdout;
  ready = false;
  abortController;
  exitError;
  exitListeners = [];
  processExitHandler;
  abortHandler;
  constructor(X) {
    this.options = X;
    this.abortController = X.abortController || O6(), this.initialize();
  }
  getDefaultExecutable() {
    return R6() ? "bun" : "node";
  }
  spawnLocalProcess(X) {
    let { command: Q, args: $, cwd: Y, env: W, signal: J } = X, G = W.DEBUG_CLAUDE_AGENT_SDK || this.options.stderr ? "pipe" : "ignore", H = YV(Q, $, { cwd: Y, stdio: ["pipe", "pipe", G], signal: J, env: W, windowsHide: true });
    if (W.DEBUG_CLAUDE_AGENT_SDK || this.options.stderr) H.stderr.on("data", (z) => {
      let K = z.toString();
      if (N1(K), this.options.stderr) this.options.stderr(K);
    });
    return { stdin: H.stdin, stdout: H.stdout, get killed() {
      return H.killed;
    }, get exitCode() {
      return H.exitCode;
    }, kill: H.kill.bind(H), on: H.on.bind(H), once: H.once.bind(H), off: H.off.bind(H) };
  }
  initialize() {
    try {
      let { additionalDirectories: X = [], agent: Q, betas: $, cwd: Y, executable: W = this.getDefaultExecutable(), executableArgs: J = [], extraArgs: G = {}, pathToClaudeCodeExecutable: H, env: B = { ...process.env }, maxThinkingTokens: z, maxTurns: K, maxBudgetUsd: V, model: L, fallbackModel: U, jsonSchema: F, permissionMode: q, allowDangerouslySkipPermissions: N, permissionPromptToolName: w, continueConversation: M, resume: R, settingSources: S, allowedTools: C = [], disallowedTools: K0 = [], tools: U0, mcpServers: s, strictMcpConfig: D0, canUseTool: q0, includePartialMessages: L1, plugins: P1, sandbox: o1 } = this.options, m = ["--output-format", "stream-json", "--verbose", "--input-format", "stream-json"];
      if (z !== void 0) m.push("--max-thinking-tokens", z.toString());
      if (this.options.effort) m.push("--effort", this.options.effort);
      if (K) m.push("--max-turns", K.toString());
      if (V !== void 0) m.push("--max-budget-usd", V.toString());
      if (L) m.push("--model", L);
      if (Q) m.push("--agent", Q);
      if ($ && $.length > 0) m.push("--betas", $.join(","));
      if (F) m.push("--json-schema", Z0(F));
      if (this.options.debugFile) m.push("--debug-file", this.options.debugFile);
      else if (this.options.debug) m.push("--debug");
      if (B.DEBUG_CLAUDE_AGENT_SDK) m.push("--debug-to-stderr");
      if (q0) {
        if (w) throw Error("canUseTool callback cannot be used with permissionPromptToolName. Please use one or the other.");
        m.push("--permission-prompt-tool", "stdio");
      } else if (w) m.push("--permission-prompt-tool", w);
      if (M) m.push("--continue");
      if (R) m.push("--resume", R);
      if (C.length > 0) m.push("--allowedTools", C.join(","));
      if (K0.length > 0) m.push("--disallowedTools", K0.join(","));
      if (U0 !== void 0) if (Array.isArray(U0)) if (U0.length === 0) m.push("--tools", "");
      else m.push("--tools", U0.join(","));
      else m.push("--tools", "default");
      if (s && Object.keys(s).length > 0) m.push("--mcp-config", Z0({ mcpServers: s }));
      if (S) m.push("--setting-sources", S.join(","));
      if (D0) m.push("--strict-mcp-config");
      if (q) m.push("--permission-mode", q);
      if (N) m.push("--allow-dangerously-skip-permissions");
      if (U) {
        if (L && U === L) throw Error("Fallback model cannot be the same as the main model. Please specify a different model for fallbackModel option.");
        m.push("--fallback-model", U);
      }
      if (L1) m.push("--include-partial-messages");
      for (let E0 of X) m.push("--add-dir", E0);
      if (P1 && P1.length > 0) for (let E0 of P1) if (E0.type === "local") m.push("--plugin-dir", E0.path);
      else throw Error(`Unsupported plugin type: ${E0.type}`);
      if (this.options.forkSession) m.push("--fork-session");
      if (this.options.resumeSessionAt) m.push("--resume-session-at", this.options.resumeSessionAt);
      if (this.options.sessionId) m.push("--session-id", this.options.sessionId);
      if (this.options.persistSession === false) m.push("--no-session-persistence");
      let $9 = KW(G ?? {}, o1);
      for (let [E0, S1] of Object.entries($9)) if (S1 === null) m.push(`--${E0}`);
      else m.push(`--${E0}`, S1);
      if (!B.CLAUDE_CODE_ENTRYPOINT) B.CLAUDE_CODE_ENTRYPOINT = "sdk-ts";
      if (delete B.NODE_OPTIONS, B.DEBUG_CLAUDE_AGENT_SDK) B.DEBUG = "1";
      else delete B.DEBUG;
      let t1 = JV(H), t6 = t1 ? H : W, a6 = t1 ? [...J, ...m] : [...J, H, ...m], H4 = { command: t6, args: a6, cwd: Y, env: B, signal: this.abortController.signal };
      if (this.options.spawnClaudeCodeProcess) N1(`Spawning Claude Code (custom): ${t6} ${a6.join(" ")}`), this.process = this.options.spawnClaudeCodeProcess(H4);
      else {
        if (!n0().existsSync(H)) {
          let S1 = t1 ? `Claude Code native binary not found at ${H}. Please ensure Claude Code is installed via native installer or specify a valid path with options.pathToClaudeCodeExecutable.` : `Claude Code executable not found at ${H}. Is options.pathToClaudeCodeExecutable set?`;
          throw ReferenceError(S1);
        }
        N1(`Spawning Claude Code: ${t6} ${a6.join(" ")}`), this.process = this.spawnLocalProcess(H4);
      }
      this.processStdin = this.process.stdin, this.processStdout = this.process.stdout;
      let B4 = () => {
        if (this.process && !this.process.killed) this.process.kill("SIGTERM");
      };
      this.processExitHandler = B4, this.abortHandler = B4, process.on("exit", this.processExitHandler), this.abortController.signal.addEventListener("abort", this.abortHandler), this.process.on("error", (E0) => {
        if (this.ready = false, this.abortController.signal.aborted) this.exitError = new F1("Claude Code process aborted by user");
        else this.exitError = Error(`Failed to spawn Claude Code process: ${E0.message}`), N1(this.exitError.message);
      }), this.process.on("exit", (E0, S1) => {
        if (this.ready = false, this.abortController.signal.aborted) this.exitError = new F1("Claude Code process aborted by user");
        else {
          let L6 = this.getProcessExitError(E0, S1);
          if (L6) this.exitError = L6, N1(L6.message);
        }
      }), this.ready = true;
    } catch (X) {
      throw this.ready = false, X;
    }
  }
  getProcessExitError(X, Q) {
    if (X !== 0 && X !== null) return Error(`Claude Code process exited with code ${X}`);
    else if (Q) return Error(`Claude Code process terminated by signal ${Q}`);
    return;
  }
  write(X) {
    if (this.abortController.signal.aborted) throw new F1("Operation aborted");
    if (!this.ready || !this.processStdin) throw Error("ProcessTransport is not ready for writing");
    if (this.process?.killed || this.process?.exitCode !== null) throw Error("Cannot write to terminated process");
    if (this.exitError) throw Error(`Cannot write to process that exited with error: ${this.exitError.message}`);
    N1(`[ProcessTransport] Writing to stdin: ${X.substring(0, 100)}`);
    try {
      if (!this.processStdin.write(X)) N1("[ProcessTransport] Write buffer full, data queued");
    } catch (Q) {
      throw this.ready = false, Error(`Failed to write to process stdin: ${Q.message}`);
    }
  }
  close() {
    if (this.processStdin) this.processStdin.end(), this.processStdin = void 0;
    if (this.abortHandler) this.abortController.signal.removeEventListener("abort", this.abortHandler), this.abortHandler = void 0;
    for (let { handler: X } of this.exitListeners) this.process?.off("exit", X);
    if (this.exitListeners = [], this.process && !this.process.killed) this.process.kill("SIGTERM"), setTimeout(() => {
      if (this.process && !this.process.killed) this.process.kill("SIGKILL");
    }, 5e3);
    if (this.ready = false, this.processExitHandler) process.off("exit", this.processExitHandler), this.processExitHandler = void 0;
  }
  isReady() {
    return this.ready;
  }
  async *readMessages() {
    if (!this.processStdout) throw Error("ProcessTransport output stream not available");
    let X = WV({ input: this.processStdout });
    try {
      for await (let Q of X) if (Q.trim()) try {
        yield q4(Q);
      } catch ($) {
        throw N1(`Non-JSON stdout: ${Q}`), Error(`CLI output was not valid JSON. This may indicate an error during startup. Output: ${Q.slice(0, 200)}${Q.length > 200 ? "..." : ""}`);
      }
      await this.waitForExit();
    } catch (Q) {
      throw Q;
    } finally {
      X.close();
    }
  }
  endInput() {
    if (this.processStdin) this.processStdin.end();
  }
  getInputStream() {
    return this.processStdin;
  }
  onExit(X) {
    if (!this.process) return () => {
    };
    let Q = ($, Y) => {
      let W = this.getProcessExitError($, Y);
      X(W);
    };
    return this.process.on("exit", Q), this.exitListeners.push({ callback: X, handler: Q }), () => {
      if (this.process) this.process.off("exit", Q);
      let $ = this.exitListeners.findIndex((Y) => Y.handler === Q);
      if ($ !== -1) this.exitListeners.splice($, 1);
    };
  }
  async waitForExit() {
    if (!this.process) {
      if (this.exitError) throw this.exitError;
      return;
    }
    if (this.process.exitCode !== null || this.process.killed) {
      if (this.exitError) throw this.exitError;
      return;
    }
    return new Promise((X, Q) => {
      let $ = (W, J) => {
        if (this.abortController.signal.aborted) {
          Q(new F1("Operation aborted"));
          return;
        }
        let G = this.getProcessExitError(W, J);
        if (G) Q(G);
        else X();
      };
      this.process.once("exit", $);
      let Y = (W) => {
        this.process.off("exit", $), Q(W);
      };
      this.process.once("error", Y), this.process.once("exit", () => {
        this.process.off("error", Y);
      });
    });
  }
};
function JV(X) {
  return ![".js", ".mjs", ".tsx", ".ts", ".jsx"].some(($) => X.endsWith($));
}
var XX = class {
  returned;
  queue = [];
  readResolve;
  readReject;
  isDone = false;
  hasError;
  started = false;
  constructor(X) {
    this.returned = X;
  }
  [Symbol.asyncIterator]() {
    if (this.started) throw Error("Stream can only be iterated once");
    return this.started = true, this;
  }
  next() {
    if (this.queue.length > 0) return Promise.resolve({ done: false, value: this.queue.shift() });
    if (this.isDone) return Promise.resolve({ done: true, value: void 0 });
    if (this.hasError) return Promise.reject(this.hasError);
    return new Promise((X, Q) => {
      this.readResolve = X, this.readReject = Q;
    });
  }
  enqueue(X) {
    if (this.readResolve) {
      let Q = this.readResolve;
      this.readResolve = void 0, this.readReject = void 0, Q({ done: false, value: X });
    } else this.queue.push(X);
  }
  done() {
    if (this.isDone = true, this.readResolve) {
      let X = this.readResolve;
      this.readResolve = void 0, this.readReject = void 0, X({ done: true, value: void 0 });
    }
  }
  error(X) {
    if (this.hasError = X, this.readReject) {
      let Q = this.readReject;
      this.readResolve = void 0, this.readReject = void 0, Q(X);
    }
  }
  return() {
    if (this.isDone = true, this.returned) this.returned();
    return Promise.resolve({ done: true, value: void 0 });
  }
};
var U9 = class {
  sendMcpMessage;
  isClosed = false;
  constructor(X) {
    this.sendMcpMessage = X;
  }
  onclose;
  onerror;
  onmessage;
  async start() {
  }
  async send(X) {
    if (this.isClosed) throw Error("Transport is closed");
    this.sendMcpMessage(X);
  }
  async close() {
    if (this.isClosed) return;
    this.isClosed = true, this.onclose?.();
  }
};
var QX = class {
  transport;
  isSingleUserTurn;
  canUseTool;
  hooks;
  abortController;
  jsonSchema;
  initConfig;
  pendingControlResponses = /* @__PURE__ */ new Map();
  cleanupPerformed = false;
  sdkMessages;
  inputStream = new XX();
  initialization;
  cancelControllers = /* @__PURE__ */ new Map();
  hookCallbacks = /* @__PURE__ */ new Map();
  nextCallbackId = 0;
  sdkMcpTransports = /* @__PURE__ */ new Map();
  sdkMcpServerInstances = /* @__PURE__ */ new Map();
  pendingMcpResponses = /* @__PURE__ */ new Map();
  firstResultReceivedResolve;
  firstResultReceived = false;
  hasBidirectionalNeeds() {
    return this.sdkMcpTransports.size > 0 || this.hooks !== void 0 && Object.keys(this.hooks).length > 0 || this.canUseTool !== void 0;
  }
  constructor(X, Q, $, Y, W, J = /* @__PURE__ */ new Map(), G, H) {
    this.transport = X;
    this.isSingleUserTurn = Q;
    this.canUseTool = $;
    this.hooks = Y;
    this.abortController = W;
    this.jsonSchema = G;
    this.initConfig = H;
    for (let [B, z] of J) this.connectSdkMcpServer(B, z);
    this.sdkMessages = this.readSdkMessages(), this.readMessages(), this.initialization = this.initialize(), this.initialization.catch(() => {
    });
  }
  setError(X) {
    this.inputStream.error(X);
  }
  close() {
    this.cleanup();
  }
  cleanup(X) {
    if (this.cleanupPerformed) return;
    this.cleanupPerformed = true;
    try {
      this.transport.close(), this.pendingControlResponses.clear(), this.pendingMcpResponses.clear(), this.cancelControllers.clear(), this.hookCallbacks.clear();
      for (let Q of this.sdkMcpTransports.values()) try {
        Q.close();
      } catch {
      }
      if (this.sdkMcpTransports.clear(), X) this.inputStream.error(X);
      else this.inputStream.done();
    } catch (Q) {
    }
  }
  next(...[X]) {
    return this.sdkMessages.next(...[X]);
  }
  return(X) {
    return this.sdkMessages.return(X);
  }
  throw(X) {
    return this.sdkMessages.throw(X);
  }
  [Symbol.asyncIterator]() {
    return this.sdkMessages;
  }
  [Symbol.asyncDispose]() {
    return this.sdkMessages[Symbol.asyncDispose]();
  }
  async readMessages() {
    try {
      for await (let X of this.transport.readMessages()) {
        if (X.type === "control_response") {
          let Q = this.pendingControlResponses.get(X.response.request_id);
          if (Q) Q(X.response);
          continue;
        } else if (X.type === "control_request") {
          this.handleControlRequest(X);
          continue;
        } else if (X.type === "control_cancel_request") {
          this.handleControlCancelRequest(X);
          continue;
        } else if (X.type === "keep_alive") continue;
        if (X.type === "streamlined_text" || X.type === "streamlined_tool_use_summary") continue;
        if (X.type === "result") {
          if (this.firstResultReceived = true, this.firstResultReceivedResolve) this.firstResultReceivedResolve();
          if (this.isSingleUserTurn) v1("[Query.readMessages] First result received for single-turn query, closing stdin"), this.transport.endInput();
        }
        this.inputStream.enqueue(X);
      }
      if (this.firstResultReceivedResolve) this.firstResultReceivedResolve();
      this.inputStream.done(), this.cleanup();
    } catch (X) {
      if (this.firstResultReceivedResolve) this.firstResultReceivedResolve();
      this.inputStream.error(X), this.cleanup(X);
    }
  }
  async handleControlRequest(X) {
    let Q = new AbortController();
    this.cancelControllers.set(X.request_id, Q);
    try {
      let $ = await this.processControlRequest(X, Q.signal), Y = { type: "control_response", response: { subtype: "success", request_id: X.request_id, response: $ } };
      await Promise.resolve(this.transport.write(Z0(Y) + `
`));
    } catch ($) {
      let Y = { type: "control_response", response: { subtype: "error", request_id: X.request_id, error: $.message || String($) } };
      await Promise.resolve(this.transport.write(Z0(Y) + `
`));
    } finally {
      this.cancelControllers.delete(X.request_id);
    }
  }
  handleControlCancelRequest(X) {
    let Q = this.cancelControllers.get(X.request_id);
    if (Q) Q.abort(), this.cancelControllers.delete(X.request_id);
  }
  async processControlRequest(X, Q) {
    if (X.request.subtype === "can_use_tool") {
      if (!this.canUseTool) throw Error("canUseTool callback is not provided.");
      return { ...await this.canUseTool(X.request.tool_name, X.request.input, { signal: Q, suggestions: X.request.permission_suggestions, blockedPath: X.request.blocked_path, decisionReason: X.request.decision_reason, toolUseID: X.request.tool_use_id, agentID: X.request.agent_id }), toolUseID: X.request.tool_use_id };
    } else if (X.request.subtype === "hook_callback") return await this.handleHookCallbacks(X.request.callback_id, X.request.input, X.request.tool_use_id, Q);
    else if (X.request.subtype === "mcp_message") {
      let $ = X.request, Y = this.sdkMcpTransports.get($.server_name);
      if (!Y) throw Error(`SDK MCP server not found: ${$.server_name}`);
      if ("method" in $.message && "id" in $.message && $.message.id !== null) return { mcp_response: await this.handleMcpControlRequest($.server_name, $, Y) };
      else {
        if (Y.onmessage) Y.onmessage($.message);
        return { mcp_response: { jsonrpc: "2.0", result: {}, id: 0 } };
      }
    }
    throw Error("Unsupported control request subtype: " + X.request.subtype);
  }
  async *readSdkMessages() {
    for await (let X of this.inputStream) yield X;
  }
  async initialize() {
    let X;
    if (this.hooks) {
      X = {};
      for (let [W, J] of Object.entries(this.hooks)) if (J.length > 0) X[W] = J.map((G) => {
        let H = [];
        for (let B of G.hooks) {
          let z = `hook_${this.nextCallbackId++}`;
          this.hookCallbacks.set(z, B), H.push(z);
        }
        return { matcher: G.matcher, hookCallbackIds: H, timeout: G.timeout };
      });
    }
    let Q = this.sdkMcpTransports.size > 0 ? Array.from(this.sdkMcpTransports.keys()) : void 0, $ = { subtype: "initialize", hooks: X, sdkMcpServers: Q, jsonSchema: this.jsonSchema, systemPrompt: this.initConfig?.systemPrompt, appendSystemPrompt: this.initConfig?.appendSystemPrompt, agents: this.initConfig?.agents };
    return (await this.request($)).response;
  }
  async interrupt() {
    await this.request({ subtype: "interrupt" });
  }
  async setPermissionMode(X) {
    await this.request({ subtype: "set_permission_mode", mode: X });
  }
  async setModel(X) {
    await this.request({ subtype: "set_model", model: X });
  }
  async setMaxThinkingTokens(X) {
    await this.request({ subtype: "set_max_thinking_tokens", max_thinking_tokens: X });
  }
  async rewindFiles(X, Q) {
    return (await this.request({ subtype: "rewind_files", user_message_id: X, dry_run: Q?.dryRun })).response;
  }
  async processPendingPermissionRequests(X) {
    for (let Q of X) if (Q.request.subtype === "can_use_tool") this.handleControlRequest(Q).catch(() => {
    });
  }
  request(X) {
    let Q = Math.random().toString(36).substring(2, 15), $ = { request_id: Q, type: "control_request", request: X };
    return new Promise((Y, W) => {
      this.pendingControlResponses.set(Q, (J) => {
        if (J.subtype === "success") Y(J);
        else if (W(Error(J.error)), J.pending_permission_requests) this.processPendingPermissionRequests(J.pending_permission_requests);
      }), Promise.resolve(this.transport.write(Z0($) + `
`));
    });
  }
  async initializationResult() {
    return this.initialization;
  }
  async supportedCommands() {
    return (await this.initialization).commands;
  }
  async supportedModels() {
    return (await this.initialization).models;
  }
  async reconnectMcpServer(X) {
    await this.request({ subtype: "mcp_reconnect", serverName: X });
  }
  async toggleMcpServer(X, Q) {
    await this.request({ subtype: "mcp_toggle", serverName: X, enabled: Q });
  }
  async mcpServerStatus() {
    return (await this.request({ subtype: "mcp_status" })).response.mcpServers;
  }
  async setMcpServers(X) {
    let Q = {}, $ = {};
    for (let [H, B] of Object.entries(X)) if (B.type === "sdk" && "instance" in B) Q[H] = B.instance;
    else $[H] = B;
    let Y = new Set(this.sdkMcpServerInstances.keys()), W = new Set(Object.keys(Q));
    for (let H of Y) if (!W.has(H)) await this.disconnectSdkMcpServer(H);
    for (let [H, B] of Object.entries(Q)) if (!Y.has(H)) this.connectSdkMcpServer(H, B);
    let J = {};
    for (let H of Object.keys(Q)) J[H] = { type: "sdk", name: H };
    return (await this.request({ subtype: "mcp_set_servers", servers: { ...$, ...J } })).response;
  }
  async accountInfo() {
    return (await this.initialization).account;
  }
  async streamInput(X) {
    v1("[Query.streamInput] Starting to process input stream");
    try {
      let Q = 0;
      for await (let $ of X) {
        if (Q++, v1(`[Query.streamInput] Processing message ${Q}: ${$.type}`), this.abortController?.signal.aborted) break;
        await Promise.resolve(this.transport.write(Z0($) + `
`));
      }
      if (v1(`[Query.streamInput] Finished processing ${Q} messages from input stream`), Q > 0 && this.hasBidirectionalNeeds()) v1("[Query.streamInput] Has bidirectional needs, waiting for first result"), await this.waitForFirstResult();
      v1("[Query] Calling transport.endInput() to close stdin to CLI process"), this.transport.endInput();
    } catch (Q) {
      if (!(Q instanceof F1)) throw Q;
    }
  }
  waitForFirstResult() {
    if (this.firstResultReceived) return v1("[Query.waitForFirstResult] Result already received, returning immediately"), Promise.resolve();
    return new Promise((X) => {
      if (this.abortController?.signal.aborted) {
        X();
        return;
      }
      this.abortController?.signal.addEventListener("abort", () => X(), { once: true }), this.firstResultReceivedResolve = X;
    });
  }
  handleHookCallbacks(X, Q, $, Y) {
    let W = this.hookCallbacks.get(X);
    if (!W) throw Error(`No hook callback found for ID: ${X}`);
    return W(Q, $, { signal: Y });
  }
  connectSdkMcpServer(X, Q) {
    let $ = new U9((Y) => this.sendMcpServerMessageToCli(X, Y));
    this.sdkMcpTransports.set(X, $), this.sdkMcpServerInstances.set(X, Q), Q.connect($);
  }
  async disconnectSdkMcpServer(X) {
    let Q = this.sdkMcpTransports.get(X);
    if (Q) await Q.close(), this.sdkMcpTransports.delete(X);
    this.sdkMcpServerInstances.delete(X);
  }
  sendMcpServerMessageToCli(X, Q) {
    if ("id" in Q && Q.id !== null && Q.id !== void 0) {
      let Y = `${X}:${Q.id}`, W = this.pendingMcpResponses.get(Y);
      if (W) {
        W.resolve(Q), this.pendingMcpResponses.delete(Y);
        return;
      }
    }
    let $ = { type: "control_request", request_id: GV(), request: { subtype: "mcp_message", server_name: X, message: Q } };
    this.transport.write(Z0($) + `
`);
  }
  handleMcpControlRequest(X, Q, $) {
    let Y = "id" in Q.message ? Q.message.id : null, W = `${X}:${Y}`;
    return new Promise((J, G) => {
      let H = () => {
        this.pendingMcpResponses.delete(W);
      }, B = (K) => {
        H(), J(K);
      }, z = (K) => {
        H(), G(K);
      };
      if (this.pendingMcpResponses.set(W, { resolve: B, reject: z }), $.onmessage) $.onmessage(Q.message);
      else {
        H(), G(Error("No message handler registered"));
        return;
      }
    });
  }
};
var n;
(function(X) {
  X.assertEqual = (W) => {
  };
  function Q(W) {
  }
  X.assertIs = Q;
  function $(W) {
    throw Error();
  }
  X.assertNever = $, X.arrayToEnum = (W) => {
    let J = {};
    for (let G of W) J[G] = G;
    return J;
  }, X.getValidEnumValues = (W) => {
    let J = X.objectKeys(W).filter((H) => typeof W[W[H]] !== "number"), G = {};
    for (let H of J) G[H] = W[H];
    return X.objectValues(G);
  }, X.objectValues = (W) => {
    return X.objectKeys(W).map(function(J) {
      return W[J];
    });
  }, X.objectKeys = typeof Object.keys === "function" ? (W) => Object.keys(W) : (W) => {
    let J = [];
    for (let G in W) if (Object.prototype.hasOwnProperty.call(W, G)) J.push(G);
    return J;
  }, X.find = (W, J) => {
    for (let G of W) if (J(G)) return G;
    return;
  }, X.isInteger = typeof Number.isInteger === "function" ? (W) => Number.isInteger(W) : (W) => typeof W === "number" && Number.isFinite(W) && Math.floor(W) === W;
  function Y(W, J = " | ") {
    return W.map((G) => typeof G === "string" ? `'${G}'` : G).join(J);
  }
  X.joinValues = Y, X.jsonStringifyReplacer = (W, J) => {
    if (typeof J === "bigint") return J.toString();
    return J;
  };
})(n || (n = {}));
var LW;
(function(X) {
  X.mergeShapes = (Q, $) => {
    return { ...Q, ...$ };
  };
})(LW || (LW = {}));
var I = n.arrayToEnum(["string", "nan", "number", "integer", "float", "boolean", "date", "bigint", "symbol", "function", "undefined", "null", "array", "object", "unknown", "promise", "void", "never", "map", "set"]);
var O1 = (X) => {
  switch (typeof X) {
    case "undefined":
      return I.undefined;
    case "string":
      return I.string;
    case "number":
      return Number.isNaN(X) ? I.nan : I.number;
    case "boolean":
      return I.boolean;
    case "function":
      return I.function;
    case "bigint":
      return I.bigint;
    case "symbol":
      return I.symbol;
    case "object":
      if (Array.isArray(X)) return I.array;
      if (X === null) return I.null;
      if (X.then && typeof X.then === "function" && X.catch && typeof X.catch === "function") return I.promise;
      if (typeof Map < "u" && X instanceof Map) return I.map;
      if (typeof Set < "u" && X instanceof Set) return I.set;
      if (typeof Date < "u" && X instanceof Date) return I.date;
      return I.object;
    default:
      return I.unknown;
  }
};
var A = n.arrayToEnum(["invalid_type", "invalid_literal", "custom", "invalid_union", "invalid_union_discriminator", "invalid_enum_value", "unrecognized_keys", "invalid_arguments", "invalid_return_type", "invalid_date", "invalid_string", "too_small", "too_big", "invalid_intersection_types", "not_multiple_of", "not_finite"]);
var h0 = class _h0 extends Error {
  get errors() {
    return this.issues;
  }
  constructor(X) {
    super();
    this.issues = [], this.addIssue = ($) => {
      this.issues = [...this.issues, $];
    }, this.addIssues = ($ = []) => {
      this.issues = [...this.issues, ...$];
    };
    let Q = new.target.prototype;
    if (Object.setPrototypeOf) Object.setPrototypeOf(this, Q);
    else this.__proto__ = Q;
    this.name = "ZodError", this.issues = X;
  }
  format(X) {
    let Q = X || function(W) {
      return W.message;
    }, $ = { _errors: [] }, Y = (W) => {
      for (let J of W.issues) if (J.code === "invalid_union") J.unionErrors.map(Y);
      else if (J.code === "invalid_return_type") Y(J.returnTypeError);
      else if (J.code === "invalid_arguments") Y(J.argumentsError);
      else if (J.path.length === 0) $._errors.push(Q(J));
      else {
        let G = $, H = 0;
        while (H < J.path.length) {
          let B = J.path[H];
          if (H !== J.path.length - 1) G[B] = G[B] || { _errors: [] };
          else G[B] = G[B] || { _errors: [] }, G[B]._errors.push(Q(J));
          G = G[B], H++;
        }
      }
    };
    return Y(this), $;
  }
  static assert(X) {
    if (!(X instanceof _h0)) throw Error(`Not a ZodError: ${X}`);
  }
  toString() {
    return this.message;
  }
  get message() {
    return JSON.stringify(this.issues, n.jsonStringifyReplacer, 2);
  }
  get isEmpty() {
    return this.issues.length === 0;
  }
  flatten(X = (Q) => Q.message) {
    let Q = {}, $ = [];
    for (let Y of this.issues) if (Y.path.length > 0) {
      let W = Y.path[0];
      Q[W] = Q[W] || [], Q[W].push(X(Y));
    } else $.push(X(Y));
    return { formErrors: $, fieldErrors: Q };
  }
  get formErrors() {
    return this.flatten();
  }
};
h0.create = (X) => {
  return new h0(X);
};
var BV = (X, Q) => {
  let $;
  switch (X.code) {
    case A.invalid_type:
      if (X.received === I.undefined) $ = "Required";
      else $ = `Expected ${X.expected}, received ${X.received}`;
      break;
    case A.invalid_literal:
      $ = `Invalid literal value, expected ${JSON.stringify(X.expected, n.jsonStringifyReplacer)}`;
      break;
    case A.unrecognized_keys:
      $ = `Unrecognized key(s) in object: ${n.joinValues(X.keys, ", ")}`;
      break;
    case A.invalid_union:
      $ = "Invalid input";
      break;
    case A.invalid_union_discriminator:
      $ = `Invalid discriminator value. Expected ${n.joinValues(X.options)}`;
      break;
    case A.invalid_enum_value:
      $ = `Invalid enum value. Expected ${n.joinValues(X.options)}, received '${X.received}'`;
      break;
    case A.invalid_arguments:
      $ = "Invalid function arguments";
      break;
    case A.invalid_return_type:
      $ = "Invalid function return type";
      break;
    case A.invalid_date:
      $ = "Invalid date";
      break;
    case A.invalid_string:
      if (typeof X.validation === "object") if ("includes" in X.validation) {
        if ($ = `Invalid input: must include "${X.validation.includes}"`, typeof X.validation.position === "number") $ = `${$} at one or more positions greater than or equal to ${X.validation.position}`;
      } else if ("startsWith" in X.validation) $ = `Invalid input: must start with "${X.validation.startsWith}"`;
      else if ("endsWith" in X.validation) $ = `Invalid input: must end with "${X.validation.endsWith}"`;
      else n.assertNever(X.validation);
      else if (X.validation !== "regex") $ = `Invalid ${X.validation}`;
      else $ = "Invalid";
      break;
    case A.too_small:
      if (X.type === "array") $ = `Array must contain ${X.exact ? "exactly" : X.inclusive ? "at least" : "more than"} ${X.minimum} element(s)`;
      else if (X.type === "string") $ = `String must contain ${X.exact ? "exactly" : X.inclusive ? "at least" : "over"} ${X.minimum} character(s)`;
      else if (X.type === "number") $ = `Number must be ${X.exact ? "exactly equal to " : X.inclusive ? "greater than or equal to " : "greater than "}${X.minimum}`;
      else if (X.type === "bigint") $ = `Number must be ${X.exact ? "exactly equal to " : X.inclusive ? "greater than or equal to " : "greater than "}${X.minimum}`;
      else if (X.type === "date") $ = `Date must be ${X.exact ? "exactly equal to " : X.inclusive ? "greater than or equal to " : "greater than "}${new Date(Number(X.minimum))}`;
      else $ = "Invalid input";
      break;
    case A.too_big:
      if (X.type === "array") $ = `Array must contain ${X.exact ? "exactly" : X.inclusive ? "at most" : "less than"} ${X.maximum} element(s)`;
      else if (X.type === "string") $ = `String must contain ${X.exact ? "exactly" : X.inclusive ? "at most" : "under"} ${X.maximum} character(s)`;
      else if (X.type === "number") $ = `Number must be ${X.exact ? "exactly" : X.inclusive ? "less than or equal to" : "less than"} ${X.maximum}`;
      else if (X.type === "bigint") $ = `BigInt must be ${X.exact ? "exactly" : X.inclusive ? "less than or equal to" : "less than"} ${X.maximum}`;
      else if (X.type === "date") $ = `Date must be ${X.exact ? "exactly" : X.inclusive ? "smaller than or equal to" : "smaller than"} ${new Date(Number(X.maximum))}`;
      else $ = "Invalid input";
      break;
    case A.custom:
      $ = "Invalid input";
      break;
    case A.invalid_intersection_types:
      $ = "Intersection results could not be merged";
      break;
    case A.not_multiple_of:
      $ = `Number must be a multiple of ${X.multipleOf}`;
      break;
    case A.not_finite:
      $ = "Number must be finite";
      break;
    default:
      $ = Q.defaultError, n.assertNever(X);
  }
  return { message: $ };
};
var T1 = BV;
var zV = T1;
function $X() {
  return zV;
}
var O4 = (X) => {
  let { data: Q, path: $, errorMaps: Y, issueData: W } = X, J = [...$, ...W.path || []], G = { ...W, path: J };
  if (W.message !== void 0) return { ...W, path: J, message: W.message };
  let H = "", B = Y.filter((z) => !!z).slice().reverse();
  for (let z of B) H = z(G, { data: Q, defaultError: H }).message;
  return { ...W, path: J, message: H };
};
function b(X, Q) {
  let $ = $X(), Y = O4({ issueData: Q, data: X.data, path: X.path, errorMaps: [X.common.contextualErrorMap, X.schemaErrorMap, $, $ === T1 ? void 0 : T1].filter((W) => !!W) });
  X.common.issues.push(Y);
}
var b0 = class _b0 {
  constructor() {
    this.value = "valid";
  }
  dirty() {
    if (this.value === "valid") this.value = "dirty";
  }
  abort() {
    if (this.value !== "aborted") this.value = "aborted";
  }
  static mergeArray(X, Q) {
    let $ = [];
    for (let Y of Q) {
      if (Y.status === "aborted") return g;
      if (Y.status === "dirty") X.dirty();
      $.push(Y.value);
    }
    return { status: X.value, value: $ };
  }
  static async mergeObjectAsync(X, Q) {
    let $ = [];
    for (let Y of Q) {
      let W = await Y.key, J = await Y.value;
      $.push({ key: W, value: J });
    }
    return _b0.mergeObjectSync(X, $);
  }
  static mergeObjectSync(X, Q) {
    let $ = {};
    for (let Y of Q) {
      let { key: W, value: J } = Y;
      if (W.status === "aborted") return g;
      if (J.status === "aborted") return g;
      if (W.status === "dirty") X.dirty();
      if (J.status === "dirty") X.dirty();
      if (W.value !== "__proto__" && (typeof J.value < "u" || Y.alwaysSet)) $[W.value] = J.value;
    }
    return { status: X.value, value: $ };
  }
};
var g = Object.freeze({ status: "aborted" });
var I6 = (X) => ({ status: "dirty", value: X });
var C0 = (X) => ({ status: "valid", value: X });
var q9 = (X) => X.status === "aborted";
var F9 = (X) => X.status === "dirty";
var a1 = (X) => X.status === "valid";
var YX = (X) => typeof Promise < "u" && X instanceof Promise;
var Z;
(function(X) {
  X.errToObj = (Q) => typeof Q === "string" ? { message: Q } : Q || {}, X.toString = (Q) => typeof Q === "string" ? Q : Q?.message;
})(Z || (Z = {}));
var r0 = class {
  constructor(X, Q, $, Y) {
    this._cachedPath = [], this.parent = X, this.data = Q, this._path = $, this._key = Y;
  }
  get path() {
    if (!this._cachedPath.length) if (Array.isArray(this._key)) this._cachedPath.push(...this._path, ...this._key);
    else this._cachedPath.push(...this._path, this._key);
    return this._cachedPath;
  }
};
var qW = (X, Q) => {
  if (a1(Q)) return { success: true, data: Q.value };
  else {
    if (!X.common.issues.length) throw Error("Validation failed but no issues detected.");
    return { success: false, get error() {
      if (this._error) return this._error;
      let $ = new h0(X.common.issues);
      return this._error = $, this._error;
    } };
  }
};
function l(X) {
  if (!X) return {};
  let { errorMap: Q, invalid_type_error: $, required_error: Y, description: W } = X;
  if (Q && ($ || Y)) throw Error(`Can't use "invalid_type_error" or "required_error" in conjunction with custom error map.`);
  if (Q) return { errorMap: Q, description: W };
  return { errorMap: (G, H) => {
    let { message: B } = X;
    if (G.code === "invalid_enum_value") return { message: B ?? H.defaultError };
    if (typeof H.data > "u") return { message: B ?? Y ?? H.defaultError };
    if (G.code !== "invalid_type") return { message: H.defaultError };
    return { message: B ?? $ ?? H.defaultError };
  }, description: W };
}
var d = class {
  get description() {
    return this._def.description;
  }
  _getType(X) {
    return O1(X.data);
  }
  _getOrReturnCtx(X, Q) {
    return Q || { common: X.parent.common, data: X.data, parsedType: O1(X.data), schemaErrorMap: this._def.errorMap, path: X.path, parent: X.parent };
  }
  _processInputParams(X) {
    return { status: new b0(), ctx: { common: X.parent.common, data: X.data, parsedType: O1(X.data), schemaErrorMap: this._def.errorMap, path: X.path, parent: X.parent } };
  }
  _parseSync(X) {
    let Q = this._parse(X);
    if (YX(Q)) throw Error("Synchronous parse encountered promise.");
    return Q;
  }
  _parseAsync(X) {
    let Q = this._parse(X);
    return Promise.resolve(Q);
  }
  parse(X, Q) {
    let $ = this.safeParse(X, Q);
    if ($.success) return $.data;
    throw $.error;
  }
  safeParse(X, Q) {
    let $ = { common: { issues: [], async: Q?.async ?? false, contextualErrorMap: Q?.errorMap }, path: Q?.path || [], schemaErrorMap: this._def.errorMap, parent: null, data: X, parsedType: O1(X) }, Y = this._parseSync({ data: X, path: $.path, parent: $ });
    return qW($, Y);
  }
  "~validate"(X) {
    let Q = { common: { issues: [], async: !!this["~standard"].async }, path: [], schemaErrorMap: this._def.errorMap, parent: null, data: X, parsedType: O1(X) };
    if (!this["~standard"].async) try {
      let $ = this._parseSync({ data: X, path: [], parent: Q });
      return a1($) ? { value: $.value } : { issues: Q.common.issues };
    } catch ($) {
      if ($?.message?.toLowerCase()?.includes("encountered")) this["~standard"].async = true;
      Q.common = { issues: [], async: true };
    }
    return this._parseAsync({ data: X, path: [], parent: Q }).then(($) => a1($) ? { value: $.value } : { issues: Q.common.issues });
  }
  async parseAsync(X, Q) {
    let $ = await this.safeParseAsync(X, Q);
    if ($.success) return $.data;
    throw $.error;
  }
  async safeParseAsync(X, Q) {
    let $ = { common: { issues: [], contextualErrorMap: Q?.errorMap, async: true }, path: Q?.path || [], schemaErrorMap: this._def.errorMap, parent: null, data: X, parsedType: O1(X) }, Y = this._parse({ data: X, path: $.path, parent: $ }), W = await (YX(Y) ? Y : Promise.resolve(Y));
    return qW($, W);
  }
  refine(X, Q) {
    let $ = (Y) => {
      if (typeof Q === "string" || typeof Q > "u") return { message: Q };
      else if (typeof Q === "function") return Q(Y);
      else return Q;
    };
    return this._refinement((Y, W) => {
      let J = X(Y), G = () => W.addIssue({ code: A.custom, ...$(Y) });
      if (typeof Promise < "u" && J instanceof Promise) return J.then((H) => {
        if (!H) return G(), false;
        else return true;
      });
      if (!J) return G(), false;
      else return true;
    });
  }
  refinement(X, Q) {
    return this._refinement(($, Y) => {
      if (!X($)) return Y.addIssue(typeof Q === "function" ? Q($, Y) : Q), false;
      else return true;
    });
  }
  _refinement(X) {
    return new G1({ schema: this, typeName: j.ZodEffects, effect: { type: "refinement", refinement: X } });
  }
  superRefine(X) {
    return this._refinement(X);
  }
  constructor(X) {
    this.spa = this.safeParseAsync, this._def = X, this.parse = this.parse.bind(this), this.safeParse = this.safeParse.bind(this), this.parseAsync = this.parseAsync.bind(this), this.safeParseAsync = this.safeParseAsync.bind(this), this.spa = this.spa.bind(this), this.refine = this.refine.bind(this), this.refinement = this.refinement.bind(this), this.superRefine = this.superRefine.bind(this), this.optional = this.optional.bind(this), this.nullable = this.nullable.bind(this), this.nullish = this.nullish.bind(this), this.array = this.array.bind(this), this.promise = this.promise.bind(this), this.or = this.or.bind(this), this.and = this.and.bind(this), this.transform = this.transform.bind(this), this.brand = this.brand.bind(this), this.default = this.default.bind(this), this.catch = this.catch.bind(this), this.describe = this.describe.bind(this), this.pipe = this.pipe.bind(this), this.readonly = this.readonly.bind(this), this.isNullable = this.isNullable.bind(this), this.isOptional = this.isOptional.bind(this), this["~standard"] = { version: 1, vendor: "zod", validate: (Q) => this["~validate"](Q) };
  }
  optional() {
    return J1.create(this, this._def);
  }
  nullable() {
    return _1.create(this, this._def);
  }
  nullish() {
    return this.nullable().optional();
  }
  array() {
    return W1.create(this);
  }
  promise() {
    return Z6.create(this, this._def);
  }
  or(X) {
    return BX.create([this, X], this._def);
  }
  and(X) {
    return zX.create(this, X, this._def);
  }
  transform(X) {
    return new G1({ ...l(this._def), schema: this, typeName: j.ZodEffects, effect: { type: "transform", transform: X } });
  }
  default(X) {
    let Q = typeof X === "function" ? X : () => X;
    return new LX({ ...l(this._def), innerType: this, defaultValue: Q, typeName: j.ZodDefault });
  }
  brand() {
    return new w9({ typeName: j.ZodBranded, type: this, ...l(this._def) });
  }
  catch(X) {
    let Q = typeof X === "function" ? X : () => X;
    return new qX({ ...l(this._def), innerType: this, catchValue: Q, typeName: j.ZodCatch });
  }
  describe(X) {
    return new this.constructor({ ...this._def, description: X });
  }
  pipe(X) {
    return E4.create(this, X);
  }
  readonly() {
    return FX.create(this);
  }
  isOptional() {
    return this.safeParse(void 0).success;
  }
  isNullable() {
    return this.safeParse(null).success;
  }
};
var KV = /^c[^\s-]{8,}$/i;
var UV = /^[0-9a-z]+$/;
var VV = /^[0-9A-HJKMNP-TV-Z]{26}$/i;
var LV = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i;
var qV = /^[a-z0-9_-]{21}$/i;
var FV = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/;
var NV = /^[-+]?P(?!$)(?:(?:[-+]?\d+Y)|(?:[-+]?\d+[.,]\d+Y$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:(?:[-+]?\d+W)|(?:[-+]?\d+[.,]\d+W$))?(?:(?:[-+]?\d+D)|(?:[-+]?\d+[.,]\d+D$))?(?:T(?=[\d+-])(?:(?:[-+]?\d+H)|(?:[-+]?\d+[.,]\d+H$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:[-+]?\d+(?:[.,]\d+)?S)?)??$/;
var OV = /^(?!\.)(?!.*\.\.)([A-Z0-9_'+\-\.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/i;
var DV = "^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$";
var N9;
var wV = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/;
var AV = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/(3[0-2]|[12]?[0-9])$/;
var MV = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;
var jV = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/;
var RV = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
var IV = /^([0-9a-zA-Z-_]{4})*(([0-9a-zA-Z-_]{2}(==)?)|([0-9a-zA-Z-_]{3}(=)?))?$/;
var FW = "((\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-((0[13578]|1[02])-(0[1-9]|[12]\\d|3[01])|(0[469]|11)-(0[1-9]|[12]\\d|30)|(02)-(0[1-9]|1\\d|2[0-8])))";
var EV = new RegExp(`^${FW}$`);
function NW(X) {
  let Q = "[0-5]\\d";
  if (X.precision) Q = `${Q}\\.\\d{${X.precision}}`;
  else if (X.precision == null) Q = `${Q}(\\.\\d+)?`;
  let $ = X.precision ? "+" : "?";
  return `([01]\\d|2[0-3]):[0-5]\\d(:${Q})${$}`;
}
function bV(X) {
  return new RegExp(`^${NW(X)}$`);
}
function PV(X) {
  let Q = `${FW}T${NW(X)}`, $ = [];
  if ($.push(X.local ? "Z?" : "Z"), X.offset) $.push("([+-]\\d{2}:?\\d{2})");
  return Q = `${Q}(${$.join("|")})`, new RegExp(`^${Q}$`);
}
function SV(X, Q) {
  if ((Q === "v4" || !Q) && wV.test(X)) return true;
  if ((Q === "v6" || !Q) && MV.test(X)) return true;
  return false;
}
function ZV(X, Q) {
  if (!FV.test(X)) return false;
  try {
    let [$] = X.split(".");
    if (!$) return false;
    let Y = $.replace(/-/g, "+").replace(/_/g, "/").padEnd($.length + (4 - $.length % 4) % 4, "="), W = JSON.parse(atob(Y));
    if (typeof W !== "object" || W === null) return false;
    if ("typ" in W && W?.typ !== "JWT") return false;
    if (!W.alg) return false;
    if (Q && W.alg !== Q) return false;
    return true;
  } catch {
    return false;
  }
}
function CV(X, Q) {
  if ((Q === "v4" || !Q) && AV.test(X)) return true;
  if ((Q === "v6" || !Q) && jV.test(X)) return true;
  return false;
}
var w1 = class _w1 extends d {
  _parse(X) {
    if (this._def.coerce) X.data = String(X.data);
    if (this._getType(X) !== I.string) {
      let W = this._getOrReturnCtx(X);
      return b(W, { code: A.invalid_type, expected: I.string, received: W.parsedType }), g;
    }
    let $ = new b0(), Y = void 0;
    for (let W of this._def.checks) if (W.kind === "min") {
      if (X.data.length < W.value) Y = this._getOrReturnCtx(X, Y), b(Y, { code: A.too_small, minimum: W.value, type: "string", inclusive: true, exact: false, message: W.message }), $.dirty();
    } else if (W.kind === "max") {
      if (X.data.length > W.value) Y = this._getOrReturnCtx(X, Y), b(Y, { code: A.too_big, maximum: W.value, type: "string", inclusive: true, exact: false, message: W.message }), $.dirty();
    } else if (W.kind === "length") {
      let J = X.data.length > W.value, G = X.data.length < W.value;
      if (J || G) {
        if (Y = this._getOrReturnCtx(X, Y), J) b(Y, { code: A.too_big, maximum: W.value, type: "string", inclusive: true, exact: true, message: W.message });
        else if (G) b(Y, { code: A.too_small, minimum: W.value, type: "string", inclusive: true, exact: true, message: W.message });
        $.dirty();
      }
    } else if (W.kind === "email") {
      if (!OV.test(X.data)) Y = this._getOrReturnCtx(X, Y), b(Y, { validation: "email", code: A.invalid_string, message: W.message }), $.dirty();
    } else if (W.kind === "emoji") {
      if (!N9) N9 = new RegExp(DV, "u");
      if (!N9.test(X.data)) Y = this._getOrReturnCtx(X, Y), b(Y, { validation: "emoji", code: A.invalid_string, message: W.message }), $.dirty();
    } else if (W.kind === "uuid") {
      if (!LV.test(X.data)) Y = this._getOrReturnCtx(X, Y), b(Y, { validation: "uuid", code: A.invalid_string, message: W.message }), $.dirty();
    } else if (W.kind === "nanoid") {
      if (!qV.test(X.data)) Y = this._getOrReturnCtx(X, Y), b(Y, { validation: "nanoid", code: A.invalid_string, message: W.message }), $.dirty();
    } else if (W.kind === "cuid") {
      if (!KV.test(X.data)) Y = this._getOrReturnCtx(X, Y), b(Y, { validation: "cuid", code: A.invalid_string, message: W.message }), $.dirty();
    } else if (W.kind === "cuid2") {
      if (!UV.test(X.data)) Y = this._getOrReturnCtx(X, Y), b(Y, { validation: "cuid2", code: A.invalid_string, message: W.message }), $.dirty();
    } else if (W.kind === "ulid") {
      if (!VV.test(X.data)) Y = this._getOrReturnCtx(X, Y), b(Y, { validation: "ulid", code: A.invalid_string, message: W.message }), $.dirty();
    } else if (W.kind === "url") try {
      new URL(X.data);
    } catch {
      Y = this._getOrReturnCtx(X, Y), b(Y, { validation: "url", code: A.invalid_string, message: W.message }), $.dirty();
    }
    else if (W.kind === "regex") {
      if (W.regex.lastIndex = 0, !W.regex.test(X.data)) Y = this._getOrReturnCtx(X, Y), b(Y, { validation: "regex", code: A.invalid_string, message: W.message }), $.dirty();
    } else if (W.kind === "trim") X.data = X.data.trim();
    else if (W.kind === "includes") {
      if (!X.data.includes(W.value, W.position)) Y = this._getOrReturnCtx(X, Y), b(Y, { code: A.invalid_string, validation: { includes: W.value, position: W.position }, message: W.message }), $.dirty();
    } else if (W.kind === "toLowerCase") X.data = X.data.toLowerCase();
    else if (W.kind === "toUpperCase") X.data = X.data.toUpperCase();
    else if (W.kind === "startsWith") {
      if (!X.data.startsWith(W.value)) Y = this._getOrReturnCtx(X, Y), b(Y, { code: A.invalid_string, validation: { startsWith: W.value }, message: W.message }), $.dirty();
    } else if (W.kind === "endsWith") {
      if (!X.data.endsWith(W.value)) Y = this._getOrReturnCtx(X, Y), b(Y, { code: A.invalid_string, validation: { endsWith: W.value }, message: W.message }), $.dirty();
    } else if (W.kind === "datetime") {
      if (!PV(W).test(X.data)) Y = this._getOrReturnCtx(X, Y), b(Y, { code: A.invalid_string, validation: "datetime", message: W.message }), $.dirty();
    } else if (W.kind === "date") {
      if (!EV.test(X.data)) Y = this._getOrReturnCtx(X, Y), b(Y, { code: A.invalid_string, validation: "date", message: W.message }), $.dirty();
    } else if (W.kind === "time") {
      if (!bV(W).test(X.data)) Y = this._getOrReturnCtx(X, Y), b(Y, { code: A.invalid_string, validation: "time", message: W.message }), $.dirty();
    } else if (W.kind === "duration") {
      if (!NV.test(X.data)) Y = this._getOrReturnCtx(X, Y), b(Y, { validation: "duration", code: A.invalid_string, message: W.message }), $.dirty();
    } else if (W.kind === "ip") {
      if (!SV(X.data, W.version)) Y = this._getOrReturnCtx(X, Y), b(Y, { validation: "ip", code: A.invalid_string, message: W.message }), $.dirty();
    } else if (W.kind === "jwt") {
      if (!ZV(X.data, W.alg)) Y = this._getOrReturnCtx(X, Y), b(Y, { validation: "jwt", code: A.invalid_string, message: W.message }), $.dirty();
    } else if (W.kind === "cidr") {
      if (!CV(X.data, W.version)) Y = this._getOrReturnCtx(X, Y), b(Y, { validation: "cidr", code: A.invalid_string, message: W.message }), $.dirty();
    } else if (W.kind === "base64") {
      if (!RV.test(X.data)) Y = this._getOrReturnCtx(X, Y), b(Y, { validation: "base64", code: A.invalid_string, message: W.message }), $.dirty();
    } else if (W.kind === "base64url") {
      if (!IV.test(X.data)) Y = this._getOrReturnCtx(X, Y), b(Y, { validation: "base64url", code: A.invalid_string, message: W.message }), $.dirty();
    } else n.assertNever(W);
    return { status: $.value, value: X.data };
  }
  _regex(X, Q, $) {
    return this.refinement((Y) => X.test(Y), { validation: Q, code: A.invalid_string, ...Z.errToObj($) });
  }
  _addCheck(X) {
    return new _w1({ ...this._def, checks: [...this._def.checks, X] });
  }
  email(X) {
    return this._addCheck({ kind: "email", ...Z.errToObj(X) });
  }
  url(X) {
    return this._addCheck({ kind: "url", ...Z.errToObj(X) });
  }
  emoji(X) {
    return this._addCheck({ kind: "emoji", ...Z.errToObj(X) });
  }
  uuid(X) {
    return this._addCheck({ kind: "uuid", ...Z.errToObj(X) });
  }
  nanoid(X) {
    return this._addCheck({ kind: "nanoid", ...Z.errToObj(X) });
  }
  cuid(X) {
    return this._addCheck({ kind: "cuid", ...Z.errToObj(X) });
  }
  cuid2(X) {
    return this._addCheck({ kind: "cuid2", ...Z.errToObj(X) });
  }
  ulid(X) {
    return this._addCheck({ kind: "ulid", ...Z.errToObj(X) });
  }
  base64(X) {
    return this._addCheck({ kind: "base64", ...Z.errToObj(X) });
  }
  base64url(X) {
    return this._addCheck({ kind: "base64url", ...Z.errToObj(X) });
  }
  jwt(X) {
    return this._addCheck({ kind: "jwt", ...Z.errToObj(X) });
  }
  ip(X) {
    return this._addCheck({ kind: "ip", ...Z.errToObj(X) });
  }
  cidr(X) {
    return this._addCheck({ kind: "cidr", ...Z.errToObj(X) });
  }
  datetime(X) {
    if (typeof X === "string") return this._addCheck({ kind: "datetime", precision: null, offset: false, local: false, message: X });
    return this._addCheck({ kind: "datetime", precision: typeof X?.precision > "u" ? null : X?.precision, offset: X?.offset ?? false, local: X?.local ?? false, ...Z.errToObj(X?.message) });
  }
  date(X) {
    return this._addCheck({ kind: "date", message: X });
  }
  time(X) {
    if (typeof X === "string") return this._addCheck({ kind: "time", precision: null, message: X });
    return this._addCheck({ kind: "time", precision: typeof X?.precision > "u" ? null : X?.precision, ...Z.errToObj(X?.message) });
  }
  duration(X) {
    return this._addCheck({ kind: "duration", ...Z.errToObj(X) });
  }
  regex(X, Q) {
    return this._addCheck({ kind: "regex", regex: X, ...Z.errToObj(Q) });
  }
  includes(X, Q) {
    return this._addCheck({ kind: "includes", value: X, position: Q?.position, ...Z.errToObj(Q?.message) });
  }
  startsWith(X, Q) {
    return this._addCheck({ kind: "startsWith", value: X, ...Z.errToObj(Q) });
  }
  endsWith(X, Q) {
    return this._addCheck({ kind: "endsWith", value: X, ...Z.errToObj(Q) });
  }
  min(X, Q) {
    return this._addCheck({ kind: "min", value: X, ...Z.errToObj(Q) });
  }
  max(X, Q) {
    return this._addCheck({ kind: "max", value: X, ...Z.errToObj(Q) });
  }
  length(X, Q) {
    return this._addCheck({ kind: "length", value: X, ...Z.errToObj(Q) });
  }
  nonempty(X) {
    return this.min(1, Z.errToObj(X));
  }
  trim() {
    return new _w1({ ...this._def, checks: [...this._def.checks, { kind: "trim" }] });
  }
  toLowerCase() {
    return new _w1({ ...this._def, checks: [...this._def.checks, { kind: "toLowerCase" }] });
  }
  toUpperCase() {
    return new _w1({ ...this._def, checks: [...this._def.checks, { kind: "toUpperCase" }] });
  }
  get isDatetime() {
    return !!this._def.checks.find((X) => X.kind === "datetime");
  }
  get isDate() {
    return !!this._def.checks.find((X) => X.kind === "date");
  }
  get isTime() {
    return !!this._def.checks.find((X) => X.kind === "time");
  }
  get isDuration() {
    return !!this._def.checks.find((X) => X.kind === "duration");
  }
  get isEmail() {
    return !!this._def.checks.find((X) => X.kind === "email");
  }
  get isURL() {
    return !!this._def.checks.find((X) => X.kind === "url");
  }
  get isEmoji() {
    return !!this._def.checks.find((X) => X.kind === "emoji");
  }
  get isUUID() {
    return !!this._def.checks.find((X) => X.kind === "uuid");
  }
  get isNANOID() {
    return !!this._def.checks.find((X) => X.kind === "nanoid");
  }
  get isCUID() {
    return !!this._def.checks.find((X) => X.kind === "cuid");
  }
  get isCUID2() {
    return !!this._def.checks.find((X) => X.kind === "cuid2");
  }
  get isULID() {
    return !!this._def.checks.find((X) => X.kind === "ulid");
  }
  get isIP() {
    return !!this._def.checks.find((X) => X.kind === "ip");
  }
  get isCIDR() {
    return !!this._def.checks.find((X) => X.kind === "cidr");
  }
  get isBase64() {
    return !!this._def.checks.find((X) => X.kind === "base64");
  }
  get isBase64url() {
    return !!this._def.checks.find((X) => X.kind === "base64url");
  }
  get minLength() {
    let X = null;
    for (let Q of this._def.checks) if (Q.kind === "min") {
      if (X === null || Q.value > X) X = Q.value;
    }
    return X;
  }
  get maxLength() {
    let X = null;
    for (let Q of this._def.checks) if (Q.kind === "max") {
      if (X === null || Q.value < X) X = Q.value;
    }
    return X;
  }
};
w1.create = (X) => {
  return new w1({ checks: [], typeName: j.ZodString, coerce: X?.coerce ?? false, ...l(X) });
};
function kV(X, Q) {
  let $ = (X.toString().split(".")[1] || "").length, Y = (Q.toString().split(".")[1] || "").length, W = $ > Y ? $ : Y, J = Number.parseInt(X.toFixed(W).replace(".", "")), G = Number.parseInt(Q.toFixed(W).replace(".", ""));
  return J % G / 10 ** W;
}
var b6 = class _b6 extends d {
  constructor() {
    super(...arguments);
    this.min = this.gte, this.max = this.lte, this.step = this.multipleOf;
  }
  _parse(X) {
    if (this._def.coerce) X.data = Number(X.data);
    if (this._getType(X) !== I.number) {
      let W = this._getOrReturnCtx(X);
      return b(W, { code: A.invalid_type, expected: I.number, received: W.parsedType }), g;
    }
    let $ = void 0, Y = new b0();
    for (let W of this._def.checks) if (W.kind === "int") {
      if (!n.isInteger(X.data)) $ = this._getOrReturnCtx(X, $), b($, { code: A.invalid_type, expected: "integer", received: "float", message: W.message }), Y.dirty();
    } else if (W.kind === "min") {
      if (W.inclusive ? X.data < W.value : X.data <= W.value) $ = this._getOrReturnCtx(X, $), b($, { code: A.too_small, minimum: W.value, type: "number", inclusive: W.inclusive, exact: false, message: W.message }), Y.dirty();
    } else if (W.kind === "max") {
      if (W.inclusive ? X.data > W.value : X.data >= W.value) $ = this._getOrReturnCtx(X, $), b($, { code: A.too_big, maximum: W.value, type: "number", inclusive: W.inclusive, exact: false, message: W.message }), Y.dirty();
    } else if (W.kind === "multipleOf") {
      if (kV(X.data, W.value) !== 0) $ = this._getOrReturnCtx(X, $), b($, { code: A.not_multiple_of, multipleOf: W.value, message: W.message }), Y.dirty();
    } else if (W.kind === "finite") {
      if (!Number.isFinite(X.data)) $ = this._getOrReturnCtx(X, $), b($, { code: A.not_finite, message: W.message }), Y.dirty();
    } else n.assertNever(W);
    return { status: Y.value, value: X.data };
  }
  gte(X, Q) {
    return this.setLimit("min", X, true, Z.toString(Q));
  }
  gt(X, Q) {
    return this.setLimit("min", X, false, Z.toString(Q));
  }
  lte(X, Q) {
    return this.setLimit("max", X, true, Z.toString(Q));
  }
  lt(X, Q) {
    return this.setLimit("max", X, false, Z.toString(Q));
  }
  setLimit(X, Q, $, Y) {
    return new _b6({ ...this._def, checks: [...this._def.checks, { kind: X, value: Q, inclusive: $, message: Z.toString(Y) }] });
  }
  _addCheck(X) {
    return new _b6({ ...this._def, checks: [...this._def.checks, X] });
  }
  int(X) {
    return this._addCheck({ kind: "int", message: Z.toString(X) });
  }
  positive(X) {
    return this._addCheck({ kind: "min", value: 0, inclusive: false, message: Z.toString(X) });
  }
  negative(X) {
    return this._addCheck({ kind: "max", value: 0, inclusive: false, message: Z.toString(X) });
  }
  nonpositive(X) {
    return this._addCheck({ kind: "max", value: 0, inclusive: true, message: Z.toString(X) });
  }
  nonnegative(X) {
    return this._addCheck({ kind: "min", value: 0, inclusive: true, message: Z.toString(X) });
  }
  multipleOf(X, Q) {
    return this._addCheck({ kind: "multipleOf", value: X, message: Z.toString(Q) });
  }
  finite(X) {
    return this._addCheck({ kind: "finite", message: Z.toString(X) });
  }
  safe(X) {
    return this._addCheck({ kind: "min", inclusive: true, value: Number.MIN_SAFE_INTEGER, message: Z.toString(X) })._addCheck({ kind: "max", inclusive: true, value: Number.MAX_SAFE_INTEGER, message: Z.toString(X) });
  }
  get minValue() {
    let X = null;
    for (let Q of this._def.checks) if (Q.kind === "min") {
      if (X === null || Q.value > X) X = Q.value;
    }
    return X;
  }
  get maxValue() {
    let X = null;
    for (let Q of this._def.checks) if (Q.kind === "max") {
      if (X === null || Q.value < X) X = Q.value;
    }
    return X;
  }
  get isInt() {
    return !!this._def.checks.find((X) => X.kind === "int" || X.kind === "multipleOf" && n.isInteger(X.value));
  }
  get isFinite() {
    let X = null, Q = null;
    for (let $ of this._def.checks) if ($.kind === "finite" || $.kind === "int" || $.kind === "multipleOf") return true;
    else if ($.kind === "min") {
      if (Q === null || $.value > Q) Q = $.value;
    } else if ($.kind === "max") {
      if (X === null || $.value < X) X = $.value;
    }
    return Number.isFinite(Q) && Number.isFinite(X);
  }
};
b6.create = (X) => {
  return new b6({ checks: [], typeName: j.ZodNumber, coerce: X?.coerce || false, ...l(X) });
};
var P6 = class _P6 extends d {
  constructor() {
    super(...arguments);
    this.min = this.gte, this.max = this.lte;
  }
  _parse(X) {
    if (this._def.coerce) try {
      X.data = BigInt(X.data);
    } catch {
      return this._getInvalidInput(X);
    }
    if (this._getType(X) !== I.bigint) return this._getInvalidInput(X);
    let $ = void 0, Y = new b0();
    for (let W of this._def.checks) if (W.kind === "min") {
      if (W.inclusive ? X.data < W.value : X.data <= W.value) $ = this._getOrReturnCtx(X, $), b($, { code: A.too_small, type: "bigint", minimum: W.value, inclusive: W.inclusive, message: W.message }), Y.dirty();
    } else if (W.kind === "max") {
      if (W.inclusive ? X.data > W.value : X.data >= W.value) $ = this._getOrReturnCtx(X, $), b($, { code: A.too_big, type: "bigint", maximum: W.value, inclusive: W.inclusive, message: W.message }), Y.dirty();
    } else if (W.kind === "multipleOf") {
      if (X.data % W.value !== BigInt(0)) $ = this._getOrReturnCtx(X, $), b($, { code: A.not_multiple_of, multipleOf: W.value, message: W.message }), Y.dirty();
    } else n.assertNever(W);
    return { status: Y.value, value: X.data };
  }
  _getInvalidInput(X) {
    let Q = this._getOrReturnCtx(X);
    return b(Q, { code: A.invalid_type, expected: I.bigint, received: Q.parsedType }), g;
  }
  gte(X, Q) {
    return this.setLimit("min", X, true, Z.toString(Q));
  }
  gt(X, Q) {
    return this.setLimit("min", X, false, Z.toString(Q));
  }
  lte(X, Q) {
    return this.setLimit("max", X, true, Z.toString(Q));
  }
  lt(X, Q) {
    return this.setLimit("max", X, false, Z.toString(Q));
  }
  setLimit(X, Q, $, Y) {
    return new _P6({ ...this._def, checks: [...this._def.checks, { kind: X, value: Q, inclusive: $, message: Z.toString(Y) }] });
  }
  _addCheck(X) {
    return new _P6({ ...this._def, checks: [...this._def.checks, X] });
  }
  positive(X) {
    return this._addCheck({ kind: "min", value: BigInt(0), inclusive: false, message: Z.toString(X) });
  }
  negative(X) {
    return this._addCheck({ kind: "max", value: BigInt(0), inclusive: false, message: Z.toString(X) });
  }
  nonpositive(X) {
    return this._addCheck({ kind: "max", value: BigInt(0), inclusive: true, message: Z.toString(X) });
  }
  nonnegative(X) {
    return this._addCheck({ kind: "min", value: BigInt(0), inclusive: true, message: Z.toString(X) });
  }
  multipleOf(X, Q) {
    return this._addCheck({ kind: "multipleOf", value: X, message: Z.toString(Q) });
  }
  get minValue() {
    let X = null;
    for (let Q of this._def.checks) if (Q.kind === "min") {
      if (X === null || Q.value > X) X = Q.value;
    }
    return X;
  }
  get maxValue() {
    let X = null;
    for (let Q of this._def.checks) if (Q.kind === "max") {
      if (X === null || Q.value < X) X = Q.value;
    }
    return X;
  }
};
P6.create = (X) => {
  return new P6({ checks: [], typeName: j.ZodBigInt, coerce: X?.coerce ?? false, ...l(X) });
};
var D4 = class extends d {
  _parse(X) {
    if (this._def.coerce) X.data = Boolean(X.data);
    if (this._getType(X) !== I.boolean) {
      let $ = this._getOrReturnCtx(X);
      return b($, { code: A.invalid_type, expected: I.boolean, received: $.parsedType }), g;
    }
    return C0(X.data);
  }
};
D4.create = (X) => {
  return new D4({ typeName: j.ZodBoolean, coerce: X?.coerce || false, ...l(X) });
};
var JX = class _JX extends d {
  _parse(X) {
    if (this._def.coerce) X.data = new Date(X.data);
    if (this._getType(X) !== I.date) {
      let W = this._getOrReturnCtx(X);
      return b(W, { code: A.invalid_type, expected: I.date, received: W.parsedType }), g;
    }
    if (Number.isNaN(X.data.getTime())) {
      let W = this._getOrReturnCtx(X);
      return b(W, { code: A.invalid_date }), g;
    }
    let $ = new b0(), Y = void 0;
    for (let W of this._def.checks) if (W.kind === "min") {
      if (X.data.getTime() < W.value) Y = this._getOrReturnCtx(X, Y), b(Y, { code: A.too_small, message: W.message, inclusive: true, exact: false, minimum: W.value, type: "date" }), $.dirty();
    } else if (W.kind === "max") {
      if (X.data.getTime() > W.value) Y = this._getOrReturnCtx(X, Y), b(Y, { code: A.too_big, message: W.message, inclusive: true, exact: false, maximum: W.value, type: "date" }), $.dirty();
    } else n.assertNever(W);
    return { status: $.value, value: new Date(X.data.getTime()) };
  }
  _addCheck(X) {
    return new _JX({ ...this._def, checks: [...this._def.checks, X] });
  }
  min(X, Q) {
    return this._addCheck({ kind: "min", value: X.getTime(), message: Z.toString(Q) });
  }
  max(X, Q) {
    return this._addCheck({ kind: "max", value: X.getTime(), message: Z.toString(Q) });
  }
  get minDate() {
    let X = null;
    for (let Q of this._def.checks) if (Q.kind === "min") {
      if (X === null || Q.value > X) X = Q.value;
    }
    return X != null ? new Date(X) : null;
  }
  get maxDate() {
    let X = null;
    for (let Q of this._def.checks) if (Q.kind === "max") {
      if (X === null || Q.value < X) X = Q.value;
    }
    return X != null ? new Date(X) : null;
  }
};
JX.create = (X) => {
  return new JX({ checks: [], coerce: X?.coerce || false, typeName: j.ZodDate, ...l(X) });
};
var w4 = class extends d {
  _parse(X) {
    if (this._getType(X) !== I.symbol) {
      let $ = this._getOrReturnCtx(X);
      return b($, { code: A.invalid_type, expected: I.symbol, received: $.parsedType }), g;
    }
    return C0(X.data);
  }
};
w4.create = (X) => {
  return new w4({ typeName: j.ZodSymbol, ...l(X) });
};
var GX = class extends d {
  _parse(X) {
    if (this._getType(X) !== I.undefined) {
      let $ = this._getOrReturnCtx(X);
      return b($, { code: A.invalid_type, expected: I.undefined, received: $.parsedType }), g;
    }
    return C0(X.data);
  }
};
GX.create = (X) => {
  return new GX({ typeName: j.ZodUndefined, ...l(X) });
};
var HX = class extends d {
  _parse(X) {
    if (this._getType(X) !== I.null) {
      let $ = this._getOrReturnCtx(X);
      return b($, { code: A.invalid_type, expected: I.null, received: $.parsedType }), g;
    }
    return C0(X.data);
  }
};
HX.create = (X) => {
  return new HX({ typeName: j.ZodNull, ...l(X) });
};
var A4 = class extends d {
  constructor() {
    super(...arguments);
    this._any = true;
  }
  _parse(X) {
    return C0(X.data);
  }
};
A4.create = (X) => {
  return new A4({ typeName: j.ZodAny, ...l(X) });
};
var s1 = class extends d {
  constructor() {
    super(...arguments);
    this._unknown = true;
  }
  _parse(X) {
    return C0(X.data);
  }
};
s1.create = (X) => {
  return new s1({ typeName: j.ZodUnknown, ...l(X) });
};
var A1 = class extends d {
  _parse(X) {
    let Q = this._getOrReturnCtx(X);
    return b(Q, { code: A.invalid_type, expected: I.never, received: Q.parsedType }), g;
  }
};
A1.create = (X) => {
  return new A1({ typeName: j.ZodNever, ...l(X) });
};
var M4 = class extends d {
  _parse(X) {
    if (this._getType(X) !== I.undefined) {
      let $ = this._getOrReturnCtx(X);
      return b($, { code: A.invalid_type, expected: I.void, received: $.parsedType }), g;
    }
    return C0(X.data);
  }
};
M4.create = (X) => {
  return new M4({ typeName: j.ZodVoid, ...l(X) });
};
var W1 = class _W1 extends d {
  _parse(X) {
    let { ctx: Q, status: $ } = this._processInputParams(X), Y = this._def;
    if (Q.parsedType !== I.array) return b(Q, { code: A.invalid_type, expected: I.array, received: Q.parsedType }), g;
    if (Y.exactLength !== null) {
      let J = Q.data.length > Y.exactLength.value, G = Q.data.length < Y.exactLength.value;
      if (J || G) b(Q, { code: J ? A.too_big : A.too_small, minimum: G ? Y.exactLength.value : void 0, maximum: J ? Y.exactLength.value : void 0, type: "array", inclusive: true, exact: true, message: Y.exactLength.message }), $.dirty();
    }
    if (Y.minLength !== null) {
      if (Q.data.length < Y.minLength.value) b(Q, { code: A.too_small, minimum: Y.minLength.value, type: "array", inclusive: true, exact: false, message: Y.minLength.message }), $.dirty();
    }
    if (Y.maxLength !== null) {
      if (Q.data.length > Y.maxLength.value) b(Q, { code: A.too_big, maximum: Y.maxLength.value, type: "array", inclusive: true, exact: false, message: Y.maxLength.message }), $.dirty();
    }
    if (Q.common.async) return Promise.all([...Q.data].map((J, G) => {
      return Y.type._parseAsync(new r0(Q, J, Q.path, G));
    })).then((J) => {
      return b0.mergeArray($, J);
    });
    let W = [...Q.data].map((J, G) => {
      return Y.type._parseSync(new r0(Q, J, Q.path, G));
    });
    return b0.mergeArray($, W);
  }
  get element() {
    return this._def.type;
  }
  min(X, Q) {
    return new _W1({ ...this._def, minLength: { value: X, message: Z.toString(Q) } });
  }
  max(X, Q) {
    return new _W1({ ...this._def, maxLength: { value: X, message: Z.toString(Q) } });
  }
  length(X, Q) {
    return new _W1({ ...this._def, exactLength: { value: X, message: Z.toString(Q) } });
  }
  nonempty(X) {
    return this.min(1, X);
  }
};
W1.create = (X, Q) => {
  return new W1({ type: X, minLength: null, maxLength: null, exactLength: null, typeName: j.ZodArray, ...l(Q) });
};
function E6(X) {
  if (X instanceof V0) {
    let Q = {};
    for (let $ in X.shape) {
      let Y = X.shape[$];
      Q[$] = J1.create(E6(Y));
    }
    return new V0({ ...X._def, shape: () => Q });
  } else if (X instanceof W1) return new W1({ ...X._def, type: E6(X.element) });
  else if (X instanceof J1) return J1.create(E6(X.unwrap()));
  else if (X instanceof _1) return _1.create(E6(X.unwrap()));
  else if (X instanceof M1) return M1.create(X.items.map((Q) => E6(Q)));
  else return X;
}
var V0 = class _V0 extends d {
  constructor() {
    super(...arguments);
    this._cached = null, this.nonstrict = this.passthrough, this.augment = this.extend;
  }
  _getCached() {
    if (this._cached !== null) return this._cached;
    let X = this._def.shape(), Q = n.objectKeys(X);
    return this._cached = { shape: X, keys: Q }, this._cached;
  }
  _parse(X) {
    if (this._getType(X) !== I.object) {
      let B = this._getOrReturnCtx(X);
      return b(B, { code: A.invalid_type, expected: I.object, received: B.parsedType }), g;
    }
    let { status: $, ctx: Y } = this._processInputParams(X), { shape: W, keys: J } = this._getCached(), G = [];
    if (!(this._def.catchall instanceof A1 && this._def.unknownKeys === "strip")) {
      for (let B in Y.data) if (!J.includes(B)) G.push(B);
    }
    let H = [];
    for (let B of J) {
      let z = W[B], K = Y.data[B];
      H.push({ key: { status: "valid", value: B }, value: z._parse(new r0(Y, K, Y.path, B)), alwaysSet: B in Y.data });
    }
    if (this._def.catchall instanceof A1) {
      let B = this._def.unknownKeys;
      if (B === "passthrough") for (let z of G) H.push({ key: { status: "valid", value: z }, value: { status: "valid", value: Y.data[z] } });
      else if (B === "strict") {
        if (G.length > 0) b(Y, { code: A.unrecognized_keys, keys: G }), $.dirty();
      } else if (B === "strip") ;
      else throw Error("Internal ZodObject error: invalid unknownKeys value.");
    } else {
      let B = this._def.catchall;
      for (let z of G) {
        let K = Y.data[z];
        H.push({ key: { status: "valid", value: z }, value: B._parse(new r0(Y, K, Y.path, z)), alwaysSet: z in Y.data });
      }
    }
    if (Y.common.async) return Promise.resolve().then(async () => {
      let B = [];
      for (let z of H) {
        let K = await z.key, V = await z.value;
        B.push({ key: K, value: V, alwaysSet: z.alwaysSet });
      }
      return B;
    }).then((B) => {
      return b0.mergeObjectSync($, B);
    });
    else return b0.mergeObjectSync($, H);
  }
  get shape() {
    return this._def.shape();
  }
  strict(X) {
    return Z.errToObj, new _V0({ ...this._def, unknownKeys: "strict", ...X !== void 0 ? { errorMap: (Q, $) => {
      let Y = this._def.errorMap?.(Q, $).message ?? $.defaultError;
      if (Q.code === "unrecognized_keys") return { message: Z.errToObj(X).message ?? Y };
      return { message: Y };
    } } : {} });
  }
  strip() {
    return new _V0({ ...this._def, unknownKeys: "strip" });
  }
  passthrough() {
    return new _V0({ ...this._def, unknownKeys: "passthrough" });
  }
  extend(X) {
    return new _V0({ ...this._def, shape: () => ({ ...this._def.shape(), ...X }) });
  }
  merge(X) {
    return new _V0({ unknownKeys: X._def.unknownKeys, catchall: X._def.catchall, shape: () => ({ ...this._def.shape(), ...X._def.shape() }), typeName: j.ZodObject });
  }
  setKey(X, Q) {
    return this.augment({ [X]: Q });
  }
  catchall(X) {
    return new _V0({ ...this._def, catchall: X });
  }
  pick(X) {
    let Q = {};
    for (let $ of n.objectKeys(X)) if (X[$] && this.shape[$]) Q[$] = this.shape[$];
    return new _V0({ ...this._def, shape: () => Q });
  }
  omit(X) {
    let Q = {};
    for (let $ of n.objectKeys(this.shape)) if (!X[$]) Q[$] = this.shape[$];
    return new _V0({ ...this._def, shape: () => Q });
  }
  deepPartial() {
    return E6(this);
  }
  partial(X) {
    let Q = {};
    for (let $ of n.objectKeys(this.shape)) {
      let Y = this.shape[$];
      if (X && !X[$]) Q[$] = Y;
      else Q[$] = Y.optional();
    }
    return new _V0({ ...this._def, shape: () => Q });
  }
  required(X) {
    let Q = {};
    for (let $ of n.objectKeys(this.shape)) if (X && !X[$]) Q[$] = this.shape[$];
    else {
      let W = this.shape[$];
      while (W instanceof J1) W = W._def.innerType;
      Q[$] = W;
    }
    return new _V0({ ...this._def, shape: () => Q });
  }
  keyof() {
    return OW(n.objectKeys(this.shape));
  }
};
V0.create = (X, Q) => {
  return new V0({ shape: () => X, unknownKeys: "strip", catchall: A1.create(), typeName: j.ZodObject, ...l(Q) });
};
V0.strictCreate = (X, Q) => {
  return new V0({ shape: () => X, unknownKeys: "strict", catchall: A1.create(), typeName: j.ZodObject, ...l(Q) });
};
V0.lazycreate = (X, Q) => {
  return new V0({ shape: X, unknownKeys: "strip", catchall: A1.create(), typeName: j.ZodObject, ...l(Q) });
};
var BX = class extends d {
  _parse(X) {
    let { ctx: Q } = this._processInputParams(X), $ = this._def.options;
    function Y(W) {
      for (let G of W) if (G.result.status === "valid") return G.result;
      for (let G of W) if (G.result.status === "dirty") return Q.common.issues.push(...G.ctx.common.issues), G.result;
      let J = W.map((G) => new h0(G.ctx.common.issues));
      return b(Q, { code: A.invalid_union, unionErrors: J }), g;
    }
    if (Q.common.async) return Promise.all($.map(async (W) => {
      let J = { ...Q, common: { ...Q.common, issues: [] }, parent: null };
      return { result: await W._parseAsync({ data: Q.data, path: Q.path, parent: J }), ctx: J };
    })).then(Y);
    else {
      let W = void 0, J = [];
      for (let H of $) {
        let B = { ...Q, common: { ...Q.common, issues: [] }, parent: null }, z = H._parseSync({ data: Q.data, path: Q.path, parent: B });
        if (z.status === "valid") return z;
        else if (z.status === "dirty" && !W) W = { result: z, ctx: B };
        if (B.common.issues.length) J.push(B.common.issues);
      }
      if (W) return Q.common.issues.push(...W.ctx.common.issues), W.result;
      let G = J.map((H) => new h0(H));
      return b(Q, { code: A.invalid_union, unionErrors: G }), g;
    }
  }
  get options() {
    return this._def.options;
  }
};
BX.create = (X, Q) => {
  return new BX({ options: X, typeName: j.ZodUnion, ...l(Q) });
};
var D1 = (X) => {
  if (X instanceof KX) return D1(X.schema);
  else if (X instanceof G1) return D1(X.innerType());
  else if (X instanceof UX) return [X.value];
  else if (X instanceof e1) return X.options;
  else if (X instanceof VX) return n.objectValues(X.enum);
  else if (X instanceof LX) return D1(X._def.innerType);
  else if (X instanceof GX) return [void 0];
  else if (X instanceof HX) return [null];
  else if (X instanceof J1) return [void 0, ...D1(X.unwrap())];
  else if (X instanceof _1) return [null, ...D1(X.unwrap())];
  else if (X instanceof w9) return D1(X.unwrap());
  else if (X instanceof FX) return D1(X.unwrap());
  else if (X instanceof qX) return D1(X._def.innerType);
  else return [];
};
var D9 = class _D9 extends d {
  _parse(X) {
    let { ctx: Q } = this._processInputParams(X);
    if (Q.parsedType !== I.object) return b(Q, { code: A.invalid_type, expected: I.object, received: Q.parsedType }), g;
    let $ = this.discriminator, Y = Q.data[$], W = this.optionsMap.get(Y);
    if (!W) return b(Q, { code: A.invalid_union_discriminator, options: Array.from(this.optionsMap.keys()), path: [$] }), g;
    if (Q.common.async) return W._parseAsync({ data: Q.data, path: Q.path, parent: Q });
    else return W._parseSync({ data: Q.data, path: Q.path, parent: Q });
  }
  get discriminator() {
    return this._def.discriminator;
  }
  get options() {
    return this._def.options;
  }
  get optionsMap() {
    return this._def.optionsMap;
  }
  static create(X, Q, $) {
    let Y = /* @__PURE__ */ new Map();
    for (let W of Q) {
      let J = D1(W.shape[X]);
      if (!J.length) throw Error(`A discriminator value for key \`${X}\` could not be extracted from all schema options`);
      for (let G of J) {
        if (Y.has(G)) throw Error(`Discriminator property ${String(X)} has duplicate value ${String(G)}`);
        Y.set(G, W);
      }
    }
    return new _D9({ typeName: j.ZodDiscriminatedUnion, discriminator: X, options: Q, optionsMap: Y, ...l($) });
  }
};
function O9(X, Q) {
  let $ = O1(X), Y = O1(Q);
  if (X === Q) return { valid: true, data: X };
  else if ($ === I.object && Y === I.object) {
    let W = n.objectKeys(Q), J = n.objectKeys(X).filter((H) => W.indexOf(H) !== -1), G = { ...X, ...Q };
    for (let H of J) {
      let B = O9(X[H], Q[H]);
      if (!B.valid) return { valid: false };
      G[H] = B.data;
    }
    return { valid: true, data: G };
  } else if ($ === I.array && Y === I.array) {
    if (X.length !== Q.length) return { valid: false };
    let W = [];
    for (let J = 0; J < X.length; J++) {
      let G = X[J], H = Q[J], B = O9(G, H);
      if (!B.valid) return { valid: false };
      W.push(B.data);
    }
    return { valid: true, data: W };
  } else if ($ === I.date && Y === I.date && +X === +Q) return { valid: true, data: X };
  else return { valid: false };
}
var zX = class extends d {
  _parse(X) {
    let { status: Q, ctx: $ } = this._processInputParams(X), Y = (W, J) => {
      if (q9(W) || q9(J)) return g;
      let G = O9(W.value, J.value);
      if (!G.valid) return b($, { code: A.invalid_intersection_types }), g;
      if (F9(W) || F9(J)) Q.dirty();
      return { status: Q.value, value: G.data };
    };
    if ($.common.async) return Promise.all([this._def.left._parseAsync({ data: $.data, path: $.path, parent: $ }), this._def.right._parseAsync({ data: $.data, path: $.path, parent: $ })]).then(([W, J]) => Y(W, J));
    else return Y(this._def.left._parseSync({ data: $.data, path: $.path, parent: $ }), this._def.right._parseSync({ data: $.data, path: $.path, parent: $ }));
  }
};
zX.create = (X, Q, $) => {
  return new zX({ left: X, right: Q, typeName: j.ZodIntersection, ...l($) });
};
var M1 = class _M1 extends d {
  _parse(X) {
    let { status: Q, ctx: $ } = this._processInputParams(X);
    if ($.parsedType !== I.array) return b($, { code: A.invalid_type, expected: I.array, received: $.parsedType }), g;
    if ($.data.length < this._def.items.length) return b($, { code: A.too_small, minimum: this._def.items.length, inclusive: true, exact: false, type: "array" }), g;
    if (!this._def.rest && $.data.length > this._def.items.length) b($, { code: A.too_big, maximum: this._def.items.length, inclusive: true, exact: false, type: "array" }), Q.dirty();
    let W = [...$.data].map((J, G) => {
      let H = this._def.items[G] || this._def.rest;
      if (!H) return null;
      return H._parse(new r0($, J, $.path, G));
    }).filter((J) => !!J);
    if ($.common.async) return Promise.all(W).then((J) => {
      return b0.mergeArray(Q, J);
    });
    else return b0.mergeArray(Q, W);
  }
  get items() {
    return this._def.items;
  }
  rest(X) {
    return new _M1({ ...this._def, rest: X });
  }
};
M1.create = (X, Q) => {
  if (!Array.isArray(X)) throw Error("You must pass an array of schemas to z.tuple([ ... ])");
  return new M1({ items: X, typeName: j.ZodTuple, rest: null, ...l(Q) });
};
var j4 = class _j4 extends d {
  get keySchema() {
    return this._def.keyType;
  }
  get valueSchema() {
    return this._def.valueType;
  }
  _parse(X) {
    let { status: Q, ctx: $ } = this._processInputParams(X);
    if ($.parsedType !== I.object) return b($, { code: A.invalid_type, expected: I.object, received: $.parsedType }), g;
    let Y = [], W = this._def.keyType, J = this._def.valueType;
    for (let G in $.data) Y.push({ key: W._parse(new r0($, G, $.path, G)), value: J._parse(new r0($, $.data[G], $.path, G)), alwaysSet: G in $.data });
    if ($.common.async) return b0.mergeObjectAsync(Q, Y);
    else return b0.mergeObjectSync(Q, Y);
  }
  get element() {
    return this._def.valueType;
  }
  static create(X, Q, $) {
    if (Q instanceof d) return new _j4({ keyType: X, valueType: Q, typeName: j.ZodRecord, ...l($) });
    return new _j4({ keyType: w1.create(), valueType: X, typeName: j.ZodRecord, ...l(Q) });
  }
};
var R4 = class extends d {
  get keySchema() {
    return this._def.keyType;
  }
  get valueSchema() {
    return this._def.valueType;
  }
  _parse(X) {
    let { status: Q, ctx: $ } = this._processInputParams(X);
    if ($.parsedType !== I.map) return b($, { code: A.invalid_type, expected: I.map, received: $.parsedType }), g;
    let Y = this._def.keyType, W = this._def.valueType, J = [...$.data.entries()].map(([G, H], B) => {
      return { key: Y._parse(new r0($, G, $.path, [B, "key"])), value: W._parse(new r0($, H, $.path, [B, "value"])) };
    });
    if ($.common.async) {
      let G = /* @__PURE__ */ new Map();
      return Promise.resolve().then(async () => {
        for (let H of J) {
          let B = await H.key, z = await H.value;
          if (B.status === "aborted" || z.status === "aborted") return g;
          if (B.status === "dirty" || z.status === "dirty") Q.dirty();
          G.set(B.value, z.value);
        }
        return { status: Q.value, value: G };
      });
    } else {
      let G = /* @__PURE__ */ new Map();
      for (let H of J) {
        let { key: B, value: z } = H;
        if (B.status === "aborted" || z.status === "aborted") return g;
        if (B.status === "dirty" || z.status === "dirty") Q.dirty();
        G.set(B.value, z.value);
      }
      return { status: Q.value, value: G };
    }
  }
};
R4.create = (X, Q, $) => {
  return new R4({ valueType: Q, keyType: X, typeName: j.ZodMap, ...l($) });
};
var S6 = class _S6 extends d {
  _parse(X) {
    let { status: Q, ctx: $ } = this._processInputParams(X);
    if ($.parsedType !== I.set) return b($, { code: A.invalid_type, expected: I.set, received: $.parsedType }), g;
    let Y = this._def;
    if (Y.minSize !== null) {
      if ($.data.size < Y.minSize.value) b($, { code: A.too_small, minimum: Y.minSize.value, type: "set", inclusive: true, exact: false, message: Y.minSize.message }), Q.dirty();
    }
    if (Y.maxSize !== null) {
      if ($.data.size > Y.maxSize.value) b($, { code: A.too_big, maximum: Y.maxSize.value, type: "set", inclusive: true, exact: false, message: Y.maxSize.message }), Q.dirty();
    }
    let W = this._def.valueType;
    function J(H) {
      let B = /* @__PURE__ */ new Set();
      for (let z of H) {
        if (z.status === "aborted") return g;
        if (z.status === "dirty") Q.dirty();
        B.add(z.value);
      }
      return { status: Q.value, value: B };
    }
    let G = [...$.data.values()].map((H, B) => W._parse(new r0($, H, $.path, B)));
    if ($.common.async) return Promise.all(G).then((H) => J(H));
    else return J(G);
  }
  min(X, Q) {
    return new _S6({ ...this._def, minSize: { value: X, message: Z.toString(Q) } });
  }
  max(X, Q) {
    return new _S6({ ...this._def, maxSize: { value: X, message: Z.toString(Q) } });
  }
  size(X, Q) {
    return this.min(X, Q).max(X, Q);
  }
  nonempty(X) {
    return this.min(1, X);
  }
};
S6.create = (X, Q) => {
  return new S6({ valueType: X, minSize: null, maxSize: null, typeName: j.ZodSet, ...l(Q) });
};
var WX = class _WX extends d {
  constructor() {
    super(...arguments);
    this.validate = this.implement;
  }
  _parse(X) {
    let { ctx: Q } = this._processInputParams(X);
    if (Q.parsedType !== I.function) return b(Q, { code: A.invalid_type, expected: I.function, received: Q.parsedType }), g;
    function $(G, H) {
      return O4({ data: G, path: Q.path, errorMaps: [Q.common.contextualErrorMap, Q.schemaErrorMap, $X(), T1].filter((B) => !!B), issueData: { code: A.invalid_arguments, argumentsError: H } });
    }
    function Y(G, H) {
      return O4({ data: G, path: Q.path, errorMaps: [Q.common.contextualErrorMap, Q.schemaErrorMap, $X(), T1].filter((B) => !!B), issueData: { code: A.invalid_return_type, returnTypeError: H } });
    }
    let W = { errorMap: Q.common.contextualErrorMap }, J = Q.data;
    if (this._def.returns instanceof Z6) {
      let G = this;
      return C0(async function(...H) {
        let B = new h0([]), z = await G._def.args.parseAsync(H, W).catch((L) => {
          throw B.addIssue($(H, L)), B;
        }), K = await Reflect.apply(J, this, z);
        return await G._def.returns._def.type.parseAsync(K, W).catch((L) => {
          throw B.addIssue(Y(K, L)), B;
        });
      });
    } else {
      let G = this;
      return C0(function(...H) {
        let B = G._def.args.safeParse(H, W);
        if (!B.success) throw new h0([$(H, B.error)]);
        let z = Reflect.apply(J, this, B.data), K = G._def.returns.safeParse(z, W);
        if (!K.success) throw new h0([Y(z, K.error)]);
        return K.data;
      });
    }
  }
  parameters() {
    return this._def.args;
  }
  returnType() {
    return this._def.returns;
  }
  args(...X) {
    return new _WX({ ...this._def, args: M1.create(X).rest(s1.create()) });
  }
  returns(X) {
    return new _WX({ ...this._def, returns: X });
  }
  implement(X) {
    return this.parse(X);
  }
  strictImplement(X) {
    return this.parse(X);
  }
  static create(X, Q, $) {
    return new _WX({ args: X ? X : M1.create([]).rest(s1.create()), returns: Q || s1.create(), typeName: j.ZodFunction, ...l($) });
  }
};
var KX = class extends d {
  get schema() {
    return this._def.getter();
  }
  _parse(X) {
    let { ctx: Q } = this._processInputParams(X);
    return this._def.getter()._parse({ data: Q.data, path: Q.path, parent: Q });
  }
};
KX.create = (X, Q) => {
  return new KX({ getter: X, typeName: j.ZodLazy, ...l(Q) });
};
var UX = class extends d {
  _parse(X) {
    if (X.data !== this._def.value) {
      let Q = this._getOrReturnCtx(X);
      return b(Q, { received: Q.data, code: A.invalid_literal, expected: this._def.value }), g;
    }
    return { status: "valid", value: X.data };
  }
  get value() {
    return this._def.value;
  }
};
UX.create = (X, Q) => {
  return new UX({ value: X, typeName: j.ZodLiteral, ...l(Q) });
};
function OW(X, Q) {
  return new e1({ values: X, typeName: j.ZodEnum, ...l(Q) });
}
var e1 = class _e1 extends d {
  _parse(X) {
    if (typeof X.data !== "string") {
      let Q = this._getOrReturnCtx(X), $ = this._def.values;
      return b(Q, { expected: n.joinValues($), received: Q.parsedType, code: A.invalid_type }), g;
    }
    if (!this._cache) this._cache = new Set(this._def.values);
    if (!this._cache.has(X.data)) {
      let Q = this._getOrReturnCtx(X), $ = this._def.values;
      return b(Q, { received: Q.data, code: A.invalid_enum_value, options: $ }), g;
    }
    return C0(X.data);
  }
  get options() {
    return this._def.values;
  }
  get enum() {
    let X = {};
    for (let Q of this._def.values) X[Q] = Q;
    return X;
  }
  get Values() {
    let X = {};
    for (let Q of this._def.values) X[Q] = Q;
    return X;
  }
  get Enum() {
    let X = {};
    for (let Q of this._def.values) X[Q] = Q;
    return X;
  }
  extract(X, Q = this._def) {
    return _e1.create(X, { ...this._def, ...Q });
  }
  exclude(X, Q = this._def) {
    return _e1.create(this.options.filter(($) => !X.includes($)), { ...this._def, ...Q });
  }
};
e1.create = OW;
var VX = class extends d {
  _parse(X) {
    let Q = n.getValidEnumValues(this._def.values), $ = this._getOrReturnCtx(X);
    if ($.parsedType !== I.string && $.parsedType !== I.number) {
      let Y = n.objectValues(Q);
      return b($, { expected: n.joinValues(Y), received: $.parsedType, code: A.invalid_type }), g;
    }
    if (!this._cache) this._cache = new Set(n.getValidEnumValues(this._def.values));
    if (!this._cache.has(X.data)) {
      let Y = n.objectValues(Q);
      return b($, { received: $.data, code: A.invalid_enum_value, options: Y }), g;
    }
    return C0(X.data);
  }
  get enum() {
    return this._def.values;
  }
};
VX.create = (X, Q) => {
  return new VX({ values: X, typeName: j.ZodNativeEnum, ...l(Q) });
};
var Z6 = class extends d {
  unwrap() {
    return this._def.type;
  }
  _parse(X) {
    let { ctx: Q } = this._processInputParams(X);
    if (Q.parsedType !== I.promise && Q.common.async === false) return b(Q, { code: A.invalid_type, expected: I.promise, received: Q.parsedType }), g;
    let $ = Q.parsedType === I.promise ? Q.data : Promise.resolve(Q.data);
    return C0($.then((Y) => {
      return this._def.type.parseAsync(Y, { path: Q.path, errorMap: Q.common.contextualErrorMap });
    }));
  }
};
Z6.create = (X, Q) => {
  return new Z6({ type: X, typeName: j.ZodPromise, ...l(Q) });
};
var G1 = class extends d {
  innerType() {
    return this._def.schema;
  }
  sourceType() {
    return this._def.schema._def.typeName === j.ZodEffects ? this._def.schema.sourceType() : this._def.schema;
  }
  _parse(X) {
    let { status: Q, ctx: $ } = this._processInputParams(X), Y = this._def.effect || null, W = { addIssue: (J) => {
      if (b($, J), J.fatal) Q.abort();
      else Q.dirty();
    }, get path() {
      return $.path;
    } };
    if (W.addIssue = W.addIssue.bind(W), Y.type === "preprocess") {
      let J = Y.transform($.data, W);
      if ($.common.async) return Promise.resolve(J).then(async (G) => {
        if (Q.value === "aborted") return g;
        let H = await this._def.schema._parseAsync({ data: G, path: $.path, parent: $ });
        if (H.status === "aborted") return g;
        if (H.status === "dirty") return I6(H.value);
        if (Q.value === "dirty") return I6(H.value);
        return H;
      });
      else {
        if (Q.value === "aborted") return g;
        let G = this._def.schema._parseSync({ data: J, path: $.path, parent: $ });
        if (G.status === "aborted") return g;
        if (G.status === "dirty") return I6(G.value);
        if (Q.value === "dirty") return I6(G.value);
        return G;
      }
    }
    if (Y.type === "refinement") {
      let J = (G) => {
        let H = Y.refinement(G, W);
        if ($.common.async) return Promise.resolve(H);
        if (H instanceof Promise) throw Error("Async refinement encountered during synchronous parse operation. Use .parseAsync instead.");
        return G;
      };
      if ($.common.async === false) {
        let G = this._def.schema._parseSync({ data: $.data, path: $.path, parent: $ });
        if (G.status === "aborted") return g;
        if (G.status === "dirty") Q.dirty();
        return J(G.value), { status: Q.value, value: G.value };
      } else return this._def.schema._parseAsync({ data: $.data, path: $.path, parent: $ }).then((G) => {
        if (G.status === "aborted") return g;
        if (G.status === "dirty") Q.dirty();
        return J(G.value).then(() => {
          return { status: Q.value, value: G.value };
        });
      });
    }
    if (Y.type === "transform") if ($.common.async === false) {
      let J = this._def.schema._parseSync({ data: $.data, path: $.path, parent: $ });
      if (!a1(J)) return g;
      let G = Y.transform(J.value, W);
      if (G instanceof Promise) throw Error("Asynchronous transform encountered during synchronous parse operation. Use .parseAsync instead.");
      return { status: Q.value, value: G };
    } else return this._def.schema._parseAsync({ data: $.data, path: $.path, parent: $ }).then((J) => {
      if (!a1(J)) return g;
      return Promise.resolve(Y.transform(J.value, W)).then((G) => ({ status: Q.value, value: G }));
    });
    n.assertNever(Y);
  }
};
G1.create = (X, Q, $) => {
  return new G1({ schema: X, typeName: j.ZodEffects, effect: Q, ...l($) });
};
G1.createWithPreprocess = (X, Q, $) => {
  return new G1({ schema: Q, effect: { type: "preprocess", transform: X }, typeName: j.ZodEffects, ...l($) });
};
var J1 = class extends d {
  _parse(X) {
    if (this._getType(X) === I.undefined) return C0(void 0);
    return this._def.innerType._parse(X);
  }
  unwrap() {
    return this._def.innerType;
  }
};
J1.create = (X, Q) => {
  return new J1({ innerType: X, typeName: j.ZodOptional, ...l(Q) });
};
var _1 = class extends d {
  _parse(X) {
    if (this._getType(X) === I.null) return C0(null);
    return this._def.innerType._parse(X);
  }
  unwrap() {
    return this._def.innerType;
  }
};
_1.create = (X, Q) => {
  return new _1({ innerType: X, typeName: j.ZodNullable, ...l(Q) });
};
var LX = class extends d {
  _parse(X) {
    let { ctx: Q } = this._processInputParams(X), $ = Q.data;
    if (Q.parsedType === I.undefined) $ = this._def.defaultValue();
    return this._def.innerType._parse({ data: $, path: Q.path, parent: Q });
  }
  removeDefault() {
    return this._def.innerType;
  }
};
LX.create = (X, Q) => {
  return new LX({ innerType: X, typeName: j.ZodDefault, defaultValue: typeof Q.default === "function" ? Q.default : () => Q.default, ...l(Q) });
};
var qX = class extends d {
  _parse(X) {
    let { ctx: Q } = this._processInputParams(X), $ = { ...Q, common: { ...Q.common, issues: [] } }, Y = this._def.innerType._parse({ data: $.data, path: $.path, parent: { ...$ } });
    if (YX(Y)) return Y.then((W) => {
      return { status: "valid", value: W.status === "valid" ? W.value : this._def.catchValue({ get error() {
        return new h0($.common.issues);
      }, input: $.data }) };
    });
    else return { status: "valid", value: Y.status === "valid" ? Y.value : this._def.catchValue({ get error() {
      return new h0($.common.issues);
    }, input: $.data }) };
  }
  removeCatch() {
    return this._def.innerType;
  }
};
qX.create = (X, Q) => {
  return new qX({ innerType: X, typeName: j.ZodCatch, catchValue: typeof Q.catch === "function" ? Q.catch : () => Q.catch, ...l(Q) });
};
var I4 = class extends d {
  _parse(X) {
    if (this._getType(X) !== I.nan) {
      let $ = this._getOrReturnCtx(X);
      return b($, { code: A.invalid_type, expected: I.nan, received: $.parsedType }), g;
    }
    return { status: "valid", value: X.data };
  }
};
I4.create = (X) => {
  return new I4({ typeName: j.ZodNaN, ...l(X) });
};
var w9 = class extends d {
  _parse(X) {
    let { ctx: Q } = this._processInputParams(X), $ = Q.data;
    return this._def.type._parse({ data: $, path: Q.path, parent: Q });
  }
  unwrap() {
    return this._def.type;
  }
};
var E4 = class _E4 extends d {
  _parse(X) {
    let { status: Q, ctx: $ } = this._processInputParams(X);
    if ($.common.async) return (async () => {
      let W = await this._def.in._parseAsync({ data: $.data, path: $.path, parent: $ });
      if (W.status === "aborted") return g;
      if (W.status === "dirty") return Q.dirty(), I6(W.value);
      else return this._def.out._parseAsync({ data: W.value, path: $.path, parent: $ });
    })();
    else {
      let Y = this._def.in._parseSync({ data: $.data, path: $.path, parent: $ });
      if (Y.status === "aborted") return g;
      if (Y.status === "dirty") return Q.dirty(), { status: "dirty", value: Y.value };
      else return this._def.out._parseSync({ data: Y.value, path: $.path, parent: $ });
    }
  }
  static create(X, Q) {
    return new _E4({ in: X, out: Q, typeName: j.ZodPipeline });
  }
};
var FX = class extends d {
  _parse(X) {
    let Q = this._def.innerType._parse(X), $ = (Y) => {
      if (a1(Y)) Y.value = Object.freeze(Y.value);
      return Y;
    };
    return YX(Q) ? Q.then((Y) => $(Y)) : $(Q);
  }
  unwrap() {
    return this._def.innerType;
  }
};
FX.create = (X, Q) => {
  return new FX({ innerType: X, typeName: j.ZodReadonly, ...l(Q) });
};
var E2 = { object: V0.lazycreate };
var j;
(function(X) {
  X.ZodString = "ZodString", X.ZodNumber = "ZodNumber", X.ZodNaN = "ZodNaN", X.ZodBigInt = "ZodBigInt", X.ZodBoolean = "ZodBoolean", X.ZodDate = "ZodDate", X.ZodSymbol = "ZodSymbol", X.ZodUndefined = "ZodUndefined", X.ZodNull = "ZodNull", X.ZodAny = "ZodAny", X.ZodUnknown = "ZodUnknown", X.ZodNever = "ZodNever", X.ZodVoid = "ZodVoid", X.ZodArray = "ZodArray", X.ZodObject = "ZodObject", X.ZodUnion = "ZodUnion", X.ZodDiscriminatedUnion = "ZodDiscriminatedUnion", X.ZodIntersection = "ZodIntersection", X.ZodTuple = "ZodTuple", X.ZodRecord = "ZodRecord", X.ZodMap = "ZodMap", X.ZodSet = "ZodSet", X.ZodFunction = "ZodFunction", X.ZodLazy = "ZodLazy", X.ZodLiteral = "ZodLiteral", X.ZodEnum = "ZodEnum", X.ZodEffects = "ZodEffects", X.ZodNativeEnum = "ZodNativeEnum", X.ZodOptional = "ZodOptional", X.ZodNullable = "ZodNullable", X.ZodDefault = "ZodDefault", X.ZodCatch = "ZodCatch", X.ZodPromise = "ZodPromise", X.ZodBranded = "ZodBranded", X.ZodPipeline = "ZodPipeline", X.ZodReadonly = "ZodReadonly";
})(j || (j = {}));
var b2 = w1.create;
var P2 = b6.create;
var S2 = I4.create;
var Z2 = P6.create;
var C2 = D4.create;
var k2 = JX.create;
var v2 = w4.create;
var T2 = GX.create;
var _2 = HX.create;
var x2 = A4.create;
var y2 = s1.create;
var g2 = A1.create;
var f2 = M4.create;
var h2 = W1.create;
var DW = V0.create;
var u2 = V0.strictCreate;
var l2 = BX.create;
var m2 = D9.create;
var c2 = zX.create;
var p2 = M1.create;
var d2 = j4.create;
var i2 = R4.create;
var n2 = S6.create;
var r2 = WX.create;
var o2 = KX.create;
var t2 = UX.create;
var a2 = e1.create;
var s2 = VX.create;
var e2 = Z6.create;
var XS = G1.create;
var QS = J1.create;
var $S = _1.create;
var YS = G1.createWithPreprocess;
var WS = E4.create;
var vV = Object.freeze({ status: "aborted" });
function O(X, Q, $) {
  function Y(H, B) {
    var z;
    Object.defineProperty(H, "_zod", { value: H._zod ?? {}, enumerable: false }), (z = H._zod).traits ?? (z.traits = /* @__PURE__ */ new Set()), H._zod.traits.add(X), Q(H, B);
    for (let K in G.prototype) if (!(K in H)) Object.defineProperty(H, K, { value: G.prototype[K].bind(H) });
    H._zod.constr = G, H._zod.def = B;
  }
  let W = $?.Parent ?? Object;
  class J extends W {
  }
  Object.defineProperty(J, "name", { value: X });
  function G(H) {
    var B;
    let z = $?.Parent ? new J() : this;
    Y(z, H), (B = z._zod).deferred ?? (B.deferred = []);
    for (let K of z._zod.deferred) K();
    return z;
  }
  return Object.defineProperty(G, "init", { value: Y }), Object.defineProperty(G, Symbol.hasInstance, { value: (H) => {
    if ($?.Parent && H instanceof $.Parent) return true;
    return H?._zod?.traits?.has(X);
  } }), Object.defineProperty(G, "name", { value: X }), G;
}
var x1 = class extends Error {
  constructor() {
    super("Encountered Promise during synchronous parse. Use .parseAsync() instead.");
  }
};
var b4 = {};
function u0(X) {
  if (X) Object.assign(b4, X);
  return b4;
}
var i = {};
V7(i, { unwrapMessage: () => NX, stringifyPrimitive: () => Z4, required: () => tV, randomString: () => lV, propertyKeyTypes: () => E9, promiseAllObject: () => uV, primitiveTypes: () => wW, prefixIssues: () => H1, pick: () => dV, partial: () => oV, optionalKeys: () => b9, omit: () => iV, numKeys: () => mV, nullish: () => wX, normalizeParams: () => y, merge: () => rV, jsonStringifyReplacer: () => M9, joinValues: () => P4, issue: () => S9, isPlainObject: () => k6, isObject: () => C6, getSizableOrigin: () => MW, getParsedType: () => cV, getLengthableOrigin: () => MX, getEnumValues: () => OX, getElementAtPath: () => hV, floatSafeRemainder: () => j9, finalizeIssue: () => o0, extend: () => nV, escapeRegex: () => y1, esc: () => X6, defineLazy: () => Y0, createTransparentProxy: () => pV, clone: () => l0, cleanRegex: () => AX, cleanEnum: () => aV, captureStackTrace: () => S4, cached: () => DX, assignProp: () => R9, assertNotEqual: () => xV, assertNever: () => gV, assertIs: () => yV, assertEqual: () => _V, assert: () => fV, allowsEval: () => I9, aborted: () => Q6, NUMBER_FORMAT_RANGES: () => P9, Class: () => jW, BIGINT_FORMAT_RANGES: () => AW });
function _V(X) {
  return X;
}
function xV(X) {
  return X;
}
function yV(X) {
}
function gV(X) {
  throw Error();
}
function fV(X) {
}
function OX(X) {
  let Q = Object.values(X).filter((Y) => typeof Y === "number");
  return Object.entries(X).filter(([Y, W]) => Q.indexOf(+Y) === -1).map(([Y, W]) => W);
}
function P4(X, Q = "|") {
  return X.map(($) => Z4($)).join(Q);
}
function M9(X, Q) {
  if (typeof Q === "bigint") return Q.toString();
  return Q;
}
function DX(X) {
  return { get value() {
    {
      let $ = X();
      return Object.defineProperty(this, "value", { value: $ }), $;
    }
    throw Error("cached value already set");
  } };
}
function wX(X) {
  return X === null || X === void 0;
}
function AX(X) {
  let Q = X.startsWith("^") ? 1 : 0, $ = X.endsWith("$") ? X.length - 1 : X.length;
  return X.slice(Q, $);
}
function j9(X, Q) {
  let $ = (X.toString().split(".")[1] || "").length, Y = (Q.toString().split(".")[1] || "").length, W = $ > Y ? $ : Y, J = Number.parseInt(X.toFixed(W).replace(".", "")), G = Number.parseInt(Q.toFixed(W).replace(".", ""));
  return J % G / 10 ** W;
}
function Y0(X, Q, $) {
  Object.defineProperty(X, Q, { get() {
    {
      let W = $();
      return X[Q] = W, W;
    }
    throw Error("cached value already set");
  }, set(W) {
    Object.defineProperty(X, Q, { value: W });
  }, configurable: true });
}
function R9(X, Q, $) {
  Object.defineProperty(X, Q, { value: $, writable: true, enumerable: true, configurable: true });
}
function hV(X, Q) {
  if (!Q) return X;
  return Q.reduce(($, Y) => $?.[Y], X);
}
function uV(X) {
  let Q = Object.keys(X), $ = Q.map((Y) => X[Y]);
  return Promise.all($).then((Y) => {
    let W = {};
    for (let J = 0; J < Q.length; J++) W[Q[J]] = Y[J];
    return W;
  });
}
function lV(X = 10) {
  let $ = "";
  for (let Y = 0; Y < X; Y++) $ += "abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 26)];
  return $;
}
function X6(X) {
  return JSON.stringify(X);
}
var S4 = Error.captureStackTrace ? Error.captureStackTrace : (...X) => {
};
function C6(X) {
  return typeof X === "object" && X !== null && !Array.isArray(X);
}
var I9 = DX(() => {
  if (typeof navigator < "u" && navigator?.userAgent?.includes("Cloudflare")) return false;
  try {
    return new Function(""), true;
  } catch (X) {
    return false;
  }
});
function k6(X) {
  if (C6(X) === false) return false;
  let Q = X.constructor;
  if (Q === void 0) return true;
  let $ = Q.prototype;
  if (C6($) === false) return false;
  if (Object.prototype.hasOwnProperty.call($, "isPrototypeOf") === false) return false;
  return true;
}
function mV(X) {
  let Q = 0;
  for (let $ in X) if (Object.prototype.hasOwnProperty.call(X, $)) Q++;
  return Q;
}
var cV = (X) => {
  let Q = typeof X;
  switch (Q) {
    case "undefined":
      return "undefined";
    case "string":
      return "string";
    case "number":
      return Number.isNaN(X) ? "nan" : "number";
    case "boolean":
      return "boolean";
    case "function":
      return "function";
    case "bigint":
      return "bigint";
    case "symbol":
      return "symbol";
    case "object":
      if (Array.isArray(X)) return "array";
      if (X === null) return "null";
      if (X.then && typeof X.then === "function" && X.catch && typeof X.catch === "function") return "promise";
      if (typeof Map < "u" && X instanceof Map) return "map";
      if (typeof Set < "u" && X instanceof Set) return "set";
      if (typeof Date < "u" && X instanceof Date) return "date";
      if (typeof File < "u" && X instanceof File) return "file";
      return "object";
    default:
      throw Error(`Unknown data type: ${Q}`);
  }
};
var E9 = /* @__PURE__ */ new Set(["string", "number", "symbol"]);
var wW = /* @__PURE__ */ new Set(["string", "number", "bigint", "boolean", "symbol", "undefined"]);
function y1(X) {
  return X.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function l0(X, Q, $) {
  let Y = new X._zod.constr(Q ?? X._zod.def);
  if (!Q || $?.parent) Y._zod.parent = X;
  return Y;
}
function y(X) {
  let Q = X;
  if (!Q) return {};
  if (typeof Q === "string") return { error: () => Q };
  if (Q?.message !== void 0) {
    if (Q?.error !== void 0) throw Error("Cannot specify both `message` and `error` params");
    Q.error = Q.message;
  }
  if (delete Q.message, typeof Q.error === "string") return { ...Q, error: () => Q.error };
  return Q;
}
function pV(X) {
  let Q;
  return new Proxy({}, { get($, Y, W) {
    return Q ?? (Q = X()), Reflect.get(Q, Y, W);
  }, set($, Y, W, J) {
    return Q ?? (Q = X()), Reflect.set(Q, Y, W, J);
  }, has($, Y) {
    return Q ?? (Q = X()), Reflect.has(Q, Y);
  }, deleteProperty($, Y) {
    return Q ?? (Q = X()), Reflect.deleteProperty(Q, Y);
  }, ownKeys($) {
    return Q ?? (Q = X()), Reflect.ownKeys(Q);
  }, getOwnPropertyDescriptor($, Y) {
    return Q ?? (Q = X()), Reflect.getOwnPropertyDescriptor(Q, Y);
  }, defineProperty($, Y, W) {
    return Q ?? (Q = X()), Reflect.defineProperty(Q, Y, W);
  } });
}
function Z4(X) {
  if (typeof X === "bigint") return X.toString() + "n";
  if (typeof X === "string") return `"${X}"`;
  return `${X}`;
}
function b9(X) {
  return Object.keys(X).filter((Q) => {
    return X[Q]._zod.optin === "optional" && X[Q]._zod.optout === "optional";
  });
}
var P9 = { safeint: [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER], int32: [-2147483648, 2147483647], uint32: [0, 4294967295], float32: [-34028234663852886e22, 34028234663852886e22], float64: [-Number.MAX_VALUE, Number.MAX_VALUE] };
var AW = { int64: [BigInt("-9223372036854775808"), BigInt("9223372036854775807")], uint64: [BigInt(0), BigInt("18446744073709551615")] };
function dV(X, Q) {
  let $ = {}, Y = X._zod.def;
  for (let W in Q) {
    if (!(W in Y.shape)) throw Error(`Unrecognized key: "${W}"`);
    if (!Q[W]) continue;
    $[W] = Y.shape[W];
  }
  return l0(X, { ...X._zod.def, shape: $, checks: [] });
}
function iV(X, Q) {
  let $ = { ...X._zod.def.shape }, Y = X._zod.def;
  for (let W in Q) {
    if (!(W in Y.shape)) throw Error(`Unrecognized key: "${W}"`);
    if (!Q[W]) continue;
    delete $[W];
  }
  return l0(X, { ...X._zod.def, shape: $, checks: [] });
}
function nV(X, Q) {
  if (!k6(Q)) throw Error("Invalid input to extend: expected a plain object");
  let $ = { ...X._zod.def, get shape() {
    let Y = { ...X._zod.def.shape, ...Q };
    return R9(this, "shape", Y), Y;
  }, checks: [] };
  return l0(X, $);
}
function rV(X, Q) {
  return l0(X, { ...X._zod.def, get shape() {
    let $ = { ...X._zod.def.shape, ...Q._zod.def.shape };
    return R9(this, "shape", $), $;
  }, catchall: Q._zod.def.catchall, checks: [] });
}
function oV(X, Q, $) {
  let Y = Q._zod.def.shape, W = { ...Y };
  if ($) for (let J in $) {
    if (!(J in Y)) throw Error(`Unrecognized key: "${J}"`);
    if (!$[J]) continue;
    W[J] = X ? new X({ type: "optional", innerType: Y[J] }) : Y[J];
  }
  else for (let J in Y) W[J] = X ? new X({ type: "optional", innerType: Y[J] }) : Y[J];
  return l0(Q, { ...Q._zod.def, shape: W, checks: [] });
}
function tV(X, Q, $) {
  let Y = Q._zod.def.shape, W = { ...Y };
  if ($) for (let J in $) {
    if (!(J in W)) throw Error(`Unrecognized key: "${J}"`);
    if (!$[J]) continue;
    W[J] = new X({ type: "nonoptional", innerType: Y[J] });
  }
  else for (let J in Y) W[J] = new X({ type: "nonoptional", innerType: Y[J] });
  return l0(Q, { ...Q._zod.def, shape: W, checks: [] });
}
function Q6(X, Q = 0) {
  for (let $ = Q; $ < X.issues.length; $++) if (X.issues[$]?.continue !== true) return true;
  return false;
}
function H1(X, Q) {
  return Q.map(($) => {
    var Y;
    return (Y = $).path ?? (Y.path = []), $.path.unshift(X), $;
  });
}
function NX(X) {
  return typeof X === "string" ? X : X?.message;
}
function o0(X, Q, $) {
  let Y = { ...X, path: X.path ?? [] };
  if (!X.message) {
    let W = NX(X.inst?._zod.def?.error?.(X)) ?? NX(Q?.error?.(X)) ?? NX($.customError?.(X)) ?? NX($.localeError?.(X)) ?? "Invalid input";
    Y.message = W;
  }
  if (delete Y.inst, delete Y.continue, !Q?.reportInput) delete Y.input;
  return Y;
}
function MW(X) {
  if (X instanceof Set) return "set";
  if (X instanceof Map) return "map";
  if (X instanceof File) return "file";
  return "unknown";
}
function MX(X) {
  if (Array.isArray(X)) return "array";
  if (typeof X === "string") return "string";
  return "unknown";
}
function S9(...X) {
  let [Q, $, Y] = X;
  if (typeof Q === "string") return { message: Q, code: "custom", input: $, inst: Y };
  return { ...Q };
}
function aV(X) {
  return Object.entries(X).filter(([Q, $]) => {
    return Number.isNaN(Number.parseInt(Q, 10));
  }).map((Q) => Q[1]);
}
var jW = class {
  constructor(...X) {
  }
};
var RW = (X, Q) => {
  X.name = "$ZodError", Object.defineProperty(X, "_zod", { value: X._zod, enumerable: false }), Object.defineProperty(X, "issues", { value: Q, enumerable: false }), Object.defineProperty(X, "message", { get() {
    return JSON.stringify(Q, M9, 2);
  }, enumerable: true });
};
var C4 = O("$ZodError", RW);
var jX = O("$ZodError", RW, { Parent: Error });
function Z9(X, Q = ($) => $.message) {
  let $ = {}, Y = [];
  for (let W of X.issues) if (W.path.length > 0) $[W.path[0]] = $[W.path[0]] || [], $[W.path[0]].push(Q(W));
  else Y.push(Q(W));
  return { formErrors: Y, fieldErrors: $ };
}
function C9(X, Q) {
  let $ = Q || function(J) {
    return J.message;
  }, Y = { _errors: [] }, W = (J) => {
    for (let G of J.issues) if (G.code === "invalid_union" && G.errors.length) G.errors.map((H) => W({ issues: H }));
    else if (G.code === "invalid_key") W({ issues: G.issues });
    else if (G.code === "invalid_element") W({ issues: G.issues });
    else if (G.path.length === 0) Y._errors.push($(G));
    else {
      let H = Y, B = 0;
      while (B < G.path.length) {
        let z = G.path[B];
        if (B !== G.path.length - 1) H[z] = H[z] || { _errors: [] };
        else H[z] = H[z] || { _errors: [] }, H[z]._errors.push($(G));
        H = H[z], B++;
      }
    }
  };
  return W(X), Y;
}
var k9 = (X) => (Q, $, Y, W) => {
  let J = Y ? Object.assign(Y, { async: false }) : { async: false }, G = Q._zod.run({ value: $, issues: [] }, J);
  if (G instanceof Promise) throw new x1();
  if (G.issues.length) {
    let H = new (W?.Err ?? X)(G.issues.map((B) => o0(B, J, u0())));
    throw S4(H, W?.callee), H;
  }
  return G.value;
};
var v9 = k9(jX);
var T9 = (X) => async (Q, $, Y, W) => {
  let J = Y ? Object.assign(Y, { async: true }) : { async: true }, G = Q._zod.run({ value: $, issues: [] }, J);
  if (G instanceof Promise) G = await G;
  if (G.issues.length) {
    let H = new (W?.Err ?? X)(G.issues.map((B) => o0(B, J, u0())));
    throw S4(H, W?.callee), H;
  }
  return G.value;
};
var _9 = T9(jX);
var x9 = (X) => (Q, $, Y) => {
  let W = Y ? { ...Y, async: false } : { async: false }, J = Q._zod.run({ value: $, issues: [] }, W);
  if (J instanceof Promise) throw new x1();
  return J.issues.length ? { success: false, error: new (X ?? C4)(J.issues.map((G) => o0(G, W, u0()))) } : { success: true, data: J.value };
};
var $6 = x9(jX);
var y9 = (X) => async (Q, $, Y) => {
  let W = Y ? Object.assign(Y, { async: true }) : { async: true }, J = Q._zod.run({ value: $, issues: [] }, W);
  if (J instanceof Promise) J = await J;
  return J.issues.length ? { success: false, error: new X(J.issues.map((G) => o0(G, W, u0()))) } : { success: true, data: J.value };
};
var Y6 = y9(jX);
var IW = /^[cC][^\s-]{8,}$/;
var EW = /^[0-9a-z]+$/;
var bW = /^[0-9A-HJKMNP-TV-Za-hjkmnp-tv-z]{26}$/;
var PW = /^[0-9a-vA-V]{20}$/;
var SW = /^[A-Za-z0-9]{27}$/;
var ZW = /^[a-zA-Z0-9_-]{21}$/;
var CW = /^P(?:(\d+W)|(?!.*W)(?=\d|T\d)(\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+([.,]\d+)?S)?)?)$/;
var kW = /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/;
var g9 = (X) => {
  if (!X) return /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000)$/;
  return new RegExp(`^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-${X}[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})$`);
};
var vW = /^(?!\.)(?!.*\.\.)([A-Za-z0-9_'+\-\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/;
function TW() {
  return new RegExp("^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$", "u");
}
var _W = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/;
var xW = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|::|([0-9a-fA-F]{1,4})?::([0-9a-fA-F]{1,4}:?){0,6})$/;
var yW = /^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/([0-9]|[1-2][0-9]|3[0-2])$/;
var gW = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|::|([0-9a-fA-F]{1,4})?::([0-9a-fA-F]{1,4}:?){0,6})\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/;
var fW = /^$|^(?:[0-9a-zA-Z+/]{4})*(?:(?:[0-9a-zA-Z+/]{2}==)|(?:[0-9a-zA-Z+/]{3}=))?$/;
var f9 = /^[A-Za-z0-9_-]*$/;
var hW = /^([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+$/;
var uW = /^\+(?:[0-9]){6,14}[0-9]$/;
var lW = "(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))";
var mW = new RegExp(`^${lW}$`);
function cW(X) {
  return typeof X.precision === "number" ? X.precision === -1 ? "(?:[01]\\d|2[0-3]):[0-5]\\d" : X.precision === 0 ? "(?:[01]\\d|2[0-3]):[0-5]\\d:[0-5]\\d" : `(?:[01]\\d|2[0-3]):[0-5]\\d:[0-5]\\d\\.\\d{${X.precision}}` : "(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?";
}
function pW(X) {
  return new RegExp(`^${cW(X)}$`);
}
function dW(X) {
  let Q = cW({ precision: X.precision }), $ = ["Z"];
  if (X.local) $.push("");
  if (X.offset) $.push("([+-]\\d{2}:\\d{2})");
  let Y = `${Q}(?:${$.join("|")})`;
  return new RegExp(`^${lW}T(?:${Y})$`);
}
var iW = (X) => {
  let Q = X ? `[\\s\\S]{${X?.minimum ?? 0},${X?.maximum ?? ""}}` : "[\\s\\S]*";
  return new RegExp(`^${Q}$`);
};
var nW = /^\d+$/;
var rW = /^-?\d+(?:\.\d+)?/i;
var oW = /true|false/i;
var tW = /null/i;
var aW = /^[^A-Z]*$/;
var sW = /^[^a-z]*$/;
var A0 = O("$ZodCheck", (X, Q) => {
  var $;
  X._zod ?? (X._zod = {}), X._zod.def = Q, ($ = X._zod).onattach ?? ($.onattach = []);
});
var eW = { number: "number", bigint: "bigint", object: "date" };
var h9 = O("$ZodCheckLessThan", (X, Q) => {
  A0.init(X, Q);
  let $ = eW[typeof Q.value];
  X._zod.onattach.push((Y) => {
    let W = Y._zod.bag, J = (Q.inclusive ? W.maximum : W.exclusiveMaximum) ?? Number.POSITIVE_INFINITY;
    if (Q.value < J) if (Q.inclusive) W.maximum = Q.value;
    else W.exclusiveMaximum = Q.value;
  }), X._zod.check = (Y) => {
    if (Q.inclusive ? Y.value <= Q.value : Y.value < Q.value) return;
    Y.issues.push({ origin: $, code: "too_big", maximum: Q.value, input: Y.value, inclusive: Q.inclusive, inst: X, continue: !Q.abort });
  };
});
var u9 = O("$ZodCheckGreaterThan", (X, Q) => {
  A0.init(X, Q);
  let $ = eW[typeof Q.value];
  X._zod.onattach.push((Y) => {
    let W = Y._zod.bag, J = (Q.inclusive ? W.minimum : W.exclusiveMinimum) ?? Number.NEGATIVE_INFINITY;
    if (Q.value > J) if (Q.inclusive) W.minimum = Q.value;
    else W.exclusiveMinimum = Q.value;
  }), X._zod.check = (Y) => {
    if (Q.inclusive ? Y.value >= Q.value : Y.value > Q.value) return;
    Y.issues.push({ origin: $, code: "too_small", minimum: Q.value, input: Y.value, inclusive: Q.inclusive, inst: X, continue: !Q.abort });
  };
});
var XJ = O("$ZodCheckMultipleOf", (X, Q) => {
  A0.init(X, Q), X._zod.onattach.push(($) => {
    var Y;
    (Y = $._zod.bag).multipleOf ?? (Y.multipleOf = Q.value);
  }), X._zod.check = ($) => {
    if (typeof $.value !== typeof Q.value) throw Error("Cannot mix number and bigint in multiple_of check.");
    if (typeof $.value === "bigint" ? $.value % Q.value === BigInt(0) : j9($.value, Q.value) === 0) return;
    $.issues.push({ origin: typeof $.value, code: "not_multiple_of", divisor: Q.value, input: $.value, inst: X, continue: !Q.abort });
  };
});
var QJ = O("$ZodCheckNumberFormat", (X, Q) => {
  A0.init(X, Q), Q.format = Q.format || "float64";
  let $ = Q.format?.includes("int"), Y = $ ? "int" : "number", [W, J] = P9[Q.format];
  X._zod.onattach.push((G) => {
    let H = G._zod.bag;
    if (H.format = Q.format, H.minimum = W, H.maximum = J, $) H.pattern = nW;
  }), X._zod.check = (G) => {
    let H = G.value;
    if ($) {
      if (!Number.isInteger(H)) {
        G.issues.push({ expected: Y, format: Q.format, code: "invalid_type", input: H, inst: X });
        return;
      }
      if (!Number.isSafeInteger(H)) {
        if (H > 0) G.issues.push({ input: H, code: "too_big", maximum: Number.MAX_SAFE_INTEGER, note: "Integers must be within the safe integer range.", inst: X, origin: Y, continue: !Q.abort });
        else G.issues.push({ input: H, code: "too_small", minimum: Number.MIN_SAFE_INTEGER, note: "Integers must be within the safe integer range.", inst: X, origin: Y, continue: !Q.abort });
        return;
      }
    }
    if (H < W) G.issues.push({ origin: "number", input: H, code: "too_small", minimum: W, inclusive: true, inst: X, continue: !Q.abort });
    if (H > J) G.issues.push({ origin: "number", input: H, code: "too_big", maximum: J, inst: X });
  };
});
var $J = O("$ZodCheckMaxLength", (X, Q) => {
  A0.init(X, Q), X._zod.when = ($) => {
    let Y = $.value;
    return !wX(Y) && Y.length !== void 0;
  }, X._zod.onattach.push(($) => {
    let Y = $._zod.bag.maximum ?? Number.POSITIVE_INFINITY;
    if (Q.maximum < Y) $._zod.bag.maximum = Q.maximum;
  }), X._zod.check = ($) => {
    let Y = $.value;
    if (Y.length <= Q.maximum) return;
    let J = MX(Y);
    $.issues.push({ origin: J, code: "too_big", maximum: Q.maximum, inclusive: true, input: Y, inst: X, continue: !Q.abort });
  };
});
var YJ = O("$ZodCheckMinLength", (X, Q) => {
  A0.init(X, Q), X._zod.when = ($) => {
    let Y = $.value;
    return !wX(Y) && Y.length !== void 0;
  }, X._zod.onattach.push(($) => {
    let Y = $._zod.bag.minimum ?? Number.NEGATIVE_INFINITY;
    if (Q.minimum > Y) $._zod.bag.minimum = Q.minimum;
  }), X._zod.check = ($) => {
    let Y = $.value;
    if (Y.length >= Q.minimum) return;
    let J = MX(Y);
    $.issues.push({ origin: J, code: "too_small", minimum: Q.minimum, inclusive: true, input: Y, inst: X, continue: !Q.abort });
  };
});
var WJ = O("$ZodCheckLengthEquals", (X, Q) => {
  A0.init(X, Q), X._zod.when = ($) => {
    let Y = $.value;
    return !wX(Y) && Y.length !== void 0;
  }, X._zod.onattach.push(($) => {
    let Y = $._zod.bag;
    Y.minimum = Q.length, Y.maximum = Q.length, Y.length = Q.length;
  }), X._zod.check = ($) => {
    let Y = $.value, W = Y.length;
    if (W === Q.length) return;
    let J = MX(Y), G = W > Q.length;
    $.issues.push({ origin: J, ...G ? { code: "too_big", maximum: Q.length } : { code: "too_small", minimum: Q.length }, inclusive: true, exact: true, input: $.value, inst: X, continue: !Q.abort });
  };
});
var RX = O("$ZodCheckStringFormat", (X, Q) => {
  var $, Y;
  if (A0.init(X, Q), X._zod.onattach.push((W) => {
    let J = W._zod.bag;
    if (J.format = Q.format, Q.pattern) J.patterns ?? (J.patterns = /* @__PURE__ */ new Set()), J.patterns.add(Q.pattern);
  }), Q.pattern) ($ = X._zod).check ?? ($.check = (W) => {
    if (Q.pattern.lastIndex = 0, Q.pattern.test(W.value)) return;
    W.issues.push({ origin: "string", code: "invalid_format", format: Q.format, input: W.value, ...Q.pattern ? { pattern: Q.pattern.toString() } : {}, inst: X, continue: !Q.abort });
  });
  else (Y = X._zod).check ?? (Y.check = () => {
  });
});
var JJ = O("$ZodCheckRegex", (X, Q) => {
  RX.init(X, Q), X._zod.check = ($) => {
    if (Q.pattern.lastIndex = 0, Q.pattern.test($.value)) return;
    $.issues.push({ origin: "string", code: "invalid_format", format: "regex", input: $.value, pattern: Q.pattern.toString(), inst: X, continue: !Q.abort });
  };
});
var GJ = O("$ZodCheckLowerCase", (X, Q) => {
  Q.pattern ?? (Q.pattern = aW), RX.init(X, Q);
});
var HJ = O("$ZodCheckUpperCase", (X, Q) => {
  Q.pattern ?? (Q.pattern = sW), RX.init(X, Q);
});
var BJ = O("$ZodCheckIncludes", (X, Q) => {
  A0.init(X, Q);
  let $ = y1(Q.includes), Y = new RegExp(typeof Q.position === "number" ? `^.{${Q.position}}${$}` : $);
  Q.pattern = Y, X._zod.onattach.push((W) => {
    let J = W._zod.bag;
    J.patterns ?? (J.patterns = /* @__PURE__ */ new Set()), J.patterns.add(Y);
  }), X._zod.check = (W) => {
    if (W.value.includes(Q.includes, Q.position)) return;
    W.issues.push({ origin: "string", code: "invalid_format", format: "includes", includes: Q.includes, input: W.value, inst: X, continue: !Q.abort });
  };
});
var zJ = O("$ZodCheckStartsWith", (X, Q) => {
  A0.init(X, Q);
  let $ = new RegExp(`^${y1(Q.prefix)}.*`);
  Q.pattern ?? (Q.pattern = $), X._zod.onattach.push((Y) => {
    let W = Y._zod.bag;
    W.patterns ?? (W.patterns = /* @__PURE__ */ new Set()), W.patterns.add($);
  }), X._zod.check = (Y) => {
    if (Y.value.startsWith(Q.prefix)) return;
    Y.issues.push({ origin: "string", code: "invalid_format", format: "starts_with", prefix: Q.prefix, input: Y.value, inst: X, continue: !Q.abort });
  };
});
var KJ = O("$ZodCheckEndsWith", (X, Q) => {
  A0.init(X, Q);
  let $ = new RegExp(`.*${y1(Q.suffix)}$`);
  Q.pattern ?? (Q.pattern = $), X._zod.onattach.push((Y) => {
    let W = Y._zod.bag;
    W.patterns ?? (W.patterns = /* @__PURE__ */ new Set()), W.patterns.add($);
  }), X._zod.check = (Y) => {
    if (Y.value.endsWith(Q.suffix)) return;
    Y.issues.push({ origin: "string", code: "invalid_format", format: "ends_with", suffix: Q.suffix, input: Y.value, inst: X, continue: !Q.abort });
  };
});
var UJ = O("$ZodCheckOverwrite", (X, Q) => {
  A0.init(X, Q), X._zod.check = ($) => {
    $.value = Q.tx($.value);
  };
});
var l9 = class {
  constructor(X = []) {
    if (this.content = [], this.indent = 0, this) this.args = X;
  }
  indented(X) {
    this.indent += 1, X(this), this.indent -= 1;
  }
  write(X) {
    if (typeof X === "function") {
      X(this, { execution: "sync" }), X(this, { execution: "async" });
      return;
    }
    let $ = X.split(`
`).filter((J) => J), Y = Math.min(...$.map((J) => J.length - J.trimStart().length)), W = $.map((J) => J.slice(Y)).map((J) => " ".repeat(this.indent * 2) + J);
    for (let J of W) this.content.push(J);
  }
  compile() {
    let X = Function, Q = this?.args, Y = [...(this?.content ?? [""]).map((W) => `  ${W}`)];
    return new X(...Q, Y.join(`
`));
  }
};
var LJ = { major: 4, minor: 0, patch: 0 };
var X0 = O("$ZodType", (X, Q) => {
  var $;
  X ?? (X = {}), X._zod.def = Q, X._zod.bag = X._zod.bag || {}, X._zod.version = LJ;
  let Y = [...X._zod.def.checks ?? []];
  if (X._zod.traits.has("$ZodCheck")) Y.unshift(X);
  for (let W of Y) for (let J of W._zod.onattach) J(X);
  if (Y.length === 0) ($ = X._zod).deferred ?? ($.deferred = []), X._zod.deferred?.push(() => {
    X._zod.run = X._zod.parse;
  });
  else {
    let W = (J, G, H) => {
      let B = Q6(J), z;
      for (let K of G) {
        if (K._zod.when) {
          if (!K._zod.when(J)) continue;
        } else if (B) continue;
        let V = J.issues.length, L = K._zod.check(J);
        if (L instanceof Promise && H?.async === false) throw new x1();
        if (z || L instanceof Promise) z = (z ?? Promise.resolve()).then(async () => {
          if (await L, J.issues.length === V) return;
          if (!B) B = Q6(J, V);
        });
        else {
          if (J.issues.length === V) continue;
          if (!B) B = Q6(J, V);
        }
      }
      if (z) return z.then(() => {
        return J;
      });
      return J;
    };
    X._zod.run = (J, G) => {
      let H = X._zod.parse(J, G);
      if (H instanceof Promise) {
        if (G.async === false) throw new x1();
        return H.then((B) => W(B, Y, G));
      }
      return W(H, Y, G);
    };
  }
  X["~standard"] = { validate: (W) => {
    try {
      let J = $6(X, W);
      return J.success ? { value: J.data } : { issues: J.error?.issues };
    } catch (J) {
      return Y6(X, W).then((G) => G.success ? { value: G.data } : { issues: G.error?.issues });
    }
  }, vendor: "zod", version: 1 };
});
var IX = O("$ZodString", (X, Q) => {
  X0.init(X, Q), X._zod.pattern = [...X?._zod.bag?.patterns ?? []].pop() ?? iW(X._zod.bag), X._zod.parse = ($, Y) => {
    if (Q.coerce) try {
      $.value = String($.value);
    } catch (W) {
    }
    if (typeof $.value === "string") return $;
    return $.issues.push({ expected: "string", code: "invalid_type", input: $.value, inst: X }), $;
  };
});
var W0 = O("$ZodStringFormat", (X, Q) => {
  RX.init(X, Q), IX.init(X, Q);
});
var c9 = O("$ZodGUID", (X, Q) => {
  Q.pattern ?? (Q.pattern = kW), W0.init(X, Q);
});
var p9 = O("$ZodUUID", (X, Q) => {
  if (Q.version) {
    let Y = { v1: 1, v2: 2, v3: 3, v4: 4, v5: 5, v6: 6, v7: 7, v8: 8 }[Q.version];
    if (Y === void 0) throw Error(`Invalid UUID version: "${Q.version}"`);
    Q.pattern ?? (Q.pattern = g9(Y));
  } else Q.pattern ?? (Q.pattern = g9());
  W0.init(X, Q);
});
var d9 = O("$ZodEmail", (X, Q) => {
  Q.pattern ?? (Q.pattern = vW), W0.init(X, Q);
});
var i9 = O("$ZodURL", (X, Q) => {
  W0.init(X, Q), X._zod.check = ($) => {
    try {
      let Y = $.value, W = new URL(Y), J = W.href;
      if (Q.hostname) {
        if (Q.hostname.lastIndex = 0, !Q.hostname.test(W.hostname)) $.issues.push({ code: "invalid_format", format: "url", note: "Invalid hostname", pattern: hW.source, input: $.value, inst: X, continue: !Q.abort });
      }
      if (Q.protocol) {
        if (Q.protocol.lastIndex = 0, !Q.protocol.test(W.protocol.endsWith(":") ? W.protocol.slice(0, -1) : W.protocol)) $.issues.push({ code: "invalid_format", format: "url", note: "Invalid protocol", pattern: Q.protocol.source, input: $.value, inst: X, continue: !Q.abort });
      }
      if (!Y.endsWith("/") && J.endsWith("/")) $.value = J.slice(0, -1);
      else $.value = J;
      return;
    } catch (Y) {
      $.issues.push({ code: "invalid_format", format: "url", input: $.value, inst: X, continue: !Q.abort });
    }
  };
});
var n9 = O("$ZodEmoji", (X, Q) => {
  Q.pattern ?? (Q.pattern = TW()), W0.init(X, Q);
});
var r9 = O("$ZodNanoID", (X, Q) => {
  Q.pattern ?? (Q.pattern = ZW), W0.init(X, Q);
});
var o9 = O("$ZodCUID", (X, Q) => {
  Q.pattern ?? (Q.pattern = IW), W0.init(X, Q);
});
var t9 = O("$ZodCUID2", (X, Q) => {
  Q.pattern ?? (Q.pattern = EW), W0.init(X, Q);
});
var a9 = O("$ZodULID", (X, Q) => {
  Q.pattern ?? (Q.pattern = bW), W0.init(X, Q);
});
var s9 = O("$ZodXID", (X, Q) => {
  Q.pattern ?? (Q.pattern = PW), W0.init(X, Q);
});
var e9 = O("$ZodKSUID", (X, Q) => {
  Q.pattern ?? (Q.pattern = SW), W0.init(X, Q);
});
var RJ = O("$ZodISODateTime", (X, Q) => {
  Q.pattern ?? (Q.pattern = dW(Q)), W0.init(X, Q);
});
var IJ = O("$ZodISODate", (X, Q) => {
  Q.pattern ?? (Q.pattern = mW), W0.init(X, Q);
});
var EJ = O("$ZodISOTime", (X, Q) => {
  Q.pattern ?? (Q.pattern = pW(Q)), W0.init(X, Q);
});
var bJ = O("$ZodISODuration", (X, Q) => {
  Q.pattern ?? (Q.pattern = CW), W0.init(X, Q);
});
var XQ = O("$ZodIPv4", (X, Q) => {
  Q.pattern ?? (Q.pattern = _W), W0.init(X, Q), X._zod.onattach.push(($) => {
    let Y = $._zod.bag;
    Y.format = "ipv4";
  });
});
var QQ = O("$ZodIPv6", (X, Q) => {
  Q.pattern ?? (Q.pattern = xW), W0.init(X, Q), X._zod.onattach.push(($) => {
    let Y = $._zod.bag;
    Y.format = "ipv6";
  }), X._zod.check = ($) => {
    try {
      new URL(`http://[${$.value}]`);
    } catch {
      $.issues.push({ code: "invalid_format", format: "ipv6", input: $.value, inst: X, continue: !Q.abort });
    }
  };
});
var $Q = O("$ZodCIDRv4", (X, Q) => {
  Q.pattern ?? (Q.pattern = yW), W0.init(X, Q);
});
var YQ = O("$ZodCIDRv6", (X, Q) => {
  Q.pattern ?? (Q.pattern = gW), W0.init(X, Q), X._zod.check = ($) => {
    let [Y, W] = $.value.split("/");
    try {
      if (!W) throw Error();
      let J = Number(W);
      if (`${J}` !== W) throw Error();
      if (J < 0 || J > 128) throw Error();
      new URL(`http://[${Y}]`);
    } catch {
      $.issues.push({ code: "invalid_format", format: "cidrv6", input: $.value, inst: X, continue: !Q.abort });
    }
  };
});
function PJ(X) {
  if (X === "") return true;
  if (X.length % 4 !== 0) return false;
  try {
    return atob(X), true;
  } catch {
    return false;
  }
}
var WQ = O("$ZodBase64", (X, Q) => {
  Q.pattern ?? (Q.pattern = fW), W0.init(X, Q), X._zod.onattach.push(($) => {
    $._zod.bag.contentEncoding = "base64";
  }), X._zod.check = ($) => {
    if (PJ($.value)) return;
    $.issues.push({ code: "invalid_format", format: "base64", input: $.value, inst: X, continue: !Q.abort });
  };
});
function eV(X) {
  if (!f9.test(X)) return false;
  let Q = X.replace(/[-_]/g, (Y) => Y === "-" ? "+" : "/"), $ = Q.padEnd(Math.ceil(Q.length / 4) * 4, "=");
  return PJ($);
}
var JQ = O("$ZodBase64URL", (X, Q) => {
  Q.pattern ?? (Q.pattern = f9), W0.init(X, Q), X._zod.onattach.push(($) => {
    $._zod.bag.contentEncoding = "base64url";
  }), X._zod.check = ($) => {
    if (eV($.value)) return;
    $.issues.push({ code: "invalid_format", format: "base64url", input: $.value, inst: X, continue: !Q.abort });
  };
});
var GQ = O("$ZodE164", (X, Q) => {
  Q.pattern ?? (Q.pattern = uW), W0.init(X, Q);
});
function XL(X, Q = null) {
  try {
    let $ = X.split(".");
    if ($.length !== 3) return false;
    let [Y] = $;
    if (!Y) return false;
    let W = JSON.parse(atob(Y));
    if ("typ" in W && W?.typ !== "JWT") return false;
    if (!W.alg) return false;
    if (Q && (!("alg" in W) || W.alg !== Q)) return false;
    return true;
  } catch {
    return false;
  }
}
var HQ = O("$ZodJWT", (X, Q) => {
  W0.init(X, Q), X._zod.check = ($) => {
    if (XL($.value, Q.alg)) return;
    $.issues.push({ code: "invalid_format", format: "jwt", input: $.value, inst: X, continue: !Q.abort });
  };
});
var T4 = O("$ZodNumber", (X, Q) => {
  X0.init(X, Q), X._zod.pattern = X._zod.bag.pattern ?? rW, X._zod.parse = ($, Y) => {
    if (Q.coerce) try {
      $.value = Number($.value);
    } catch (G) {
    }
    let W = $.value;
    if (typeof W === "number" && !Number.isNaN(W) && Number.isFinite(W)) return $;
    let J = typeof W === "number" ? Number.isNaN(W) ? "NaN" : !Number.isFinite(W) ? "Infinity" : void 0 : void 0;
    return $.issues.push({ expected: "number", code: "invalid_type", input: W, inst: X, ...J ? { received: J } : {} }), $;
  };
});
var BQ = O("$ZodNumber", (X, Q) => {
  QJ.init(X, Q), T4.init(X, Q);
});
var zQ = O("$ZodBoolean", (X, Q) => {
  X0.init(X, Q), X._zod.pattern = oW, X._zod.parse = ($, Y) => {
    if (Q.coerce) try {
      $.value = Boolean($.value);
    } catch (J) {
    }
    let W = $.value;
    if (typeof W === "boolean") return $;
    return $.issues.push({ expected: "boolean", code: "invalid_type", input: W, inst: X }), $;
  };
});
var KQ = O("$ZodNull", (X, Q) => {
  X0.init(X, Q), X._zod.pattern = tW, X._zod.values = /* @__PURE__ */ new Set([null]), X._zod.parse = ($, Y) => {
    let W = $.value;
    if (W === null) return $;
    return $.issues.push({ expected: "null", code: "invalid_type", input: W, inst: X }), $;
  };
});
var UQ = O("$ZodUnknown", (X, Q) => {
  X0.init(X, Q), X._zod.parse = ($) => $;
});
var VQ = O("$ZodNever", (X, Q) => {
  X0.init(X, Q), X._zod.parse = ($, Y) => {
    return $.issues.push({ expected: "never", code: "invalid_type", input: $.value, inst: X }), $;
  };
});
function qJ(X, Q, $) {
  if (X.issues.length) Q.issues.push(...H1($, X.issues));
  Q.value[$] = X.value;
}
var LQ = O("$ZodArray", (X, Q) => {
  X0.init(X, Q), X._zod.parse = ($, Y) => {
    let W = $.value;
    if (!Array.isArray(W)) return $.issues.push({ expected: "array", code: "invalid_type", input: W, inst: X }), $;
    $.value = Array(W.length);
    let J = [];
    for (let G = 0; G < W.length; G++) {
      let H = W[G], B = Q.element._zod.run({ value: H, issues: [] }, Y);
      if (B instanceof Promise) J.push(B.then((z) => qJ(z, $, G)));
      else qJ(B, $, G);
    }
    if (J.length) return Promise.all(J).then(() => $);
    return $;
  };
});
function v4(X, Q, $) {
  if (X.issues.length) Q.issues.push(...H1($, X.issues));
  Q.value[$] = X.value;
}
function FJ(X, Q, $, Y) {
  if (X.issues.length) if (Y[$] === void 0) if ($ in Y) Q.value[$] = void 0;
  else Q.value[$] = X.value;
  else Q.issues.push(...H1($, X.issues));
  else if (X.value === void 0) {
    if ($ in Y) Q.value[$] = void 0;
  } else Q.value[$] = X.value;
}
var _4 = O("$ZodObject", (X, Q) => {
  X0.init(X, Q);
  let $ = DX(() => {
    let V = Object.keys(Q.shape);
    for (let U of V) if (!(Q.shape[U] instanceof X0)) throw Error(`Invalid element at key "${U}": expected a Zod schema`);
    let L = b9(Q.shape);
    return { shape: Q.shape, keys: V, keySet: new Set(V), numKeys: V.length, optionalKeys: new Set(L) };
  });
  Y0(X._zod, "propValues", () => {
    let V = Q.shape, L = {};
    for (let U in V) {
      let F = V[U]._zod;
      if (F.values) {
        L[U] ?? (L[U] = /* @__PURE__ */ new Set());
        for (let q of F.values) L[U].add(q);
      }
    }
    return L;
  });
  let Y = (V) => {
    let L = new l9(["shape", "payload", "ctx"]), U = $.value, F = (M) => {
      let R = X6(M);
      return `shape[${R}]._zod.run({ value: input[${R}], issues: [] }, ctx)`;
    };
    L.write("const input = payload.value;");
    let q = /* @__PURE__ */ Object.create(null), N = 0;
    for (let M of U.keys) q[M] = `key_${N++}`;
    L.write("const newResult = {}");
    for (let M of U.keys) if (U.optionalKeys.has(M)) {
      let R = q[M];
      L.write(`const ${R} = ${F(M)};`);
      let S = X6(M);
      L.write(`
        if (${R}.issues.length) {
          if (input[${S}] === undefined) {
            if (${S} in input) {
              newResult[${S}] = undefined;
            }
          } else {
            payload.issues = payload.issues.concat(
              ${R}.issues.map((iss) => ({
                ...iss,
                path: iss.path ? [${S}, ...iss.path] : [${S}],
              }))
            );
          }
        } else if (${R}.value === undefined) {
          if (${S} in input) newResult[${S}] = undefined;
        } else {
          newResult[${S}] = ${R}.value;
        }
        `);
    } else {
      let R = q[M];
      L.write(`const ${R} = ${F(M)};`), L.write(`
          if (${R}.issues.length) payload.issues = payload.issues.concat(${R}.issues.map(iss => ({
            ...iss,
            path: iss.path ? [${X6(M)}, ...iss.path] : [${X6(M)}]
          })));`), L.write(`newResult[${X6(M)}] = ${R}.value`);
    }
    L.write("payload.value = newResult;"), L.write("return payload;");
    let w = L.compile();
    return (M, R) => w(V, M, R);
  }, W, J = C6, G = !b4.jitless, B = G && I9.value, z = Q.catchall, K;
  X._zod.parse = (V, L) => {
    K ?? (K = $.value);
    let U = V.value;
    if (!J(U)) return V.issues.push({ expected: "object", code: "invalid_type", input: U, inst: X }), V;
    let F = [];
    if (G && B && L?.async === false && L.jitless !== true) {
      if (!W) W = Y(Q.shape);
      V = W(V, L);
    } else {
      V.value = {};
      let R = K.shape;
      for (let S of K.keys) {
        let C = R[S], K0 = C._zod.run({ value: U[S], issues: [] }, L), U0 = C._zod.optin === "optional" && C._zod.optout === "optional";
        if (K0 instanceof Promise) F.push(K0.then((s) => U0 ? FJ(s, V, S, U) : v4(s, V, S)));
        else if (U0) FJ(K0, V, S, U);
        else v4(K0, V, S);
      }
    }
    if (!z) return F.length ? Promise.all(F).then(() => V) : V;
    let q = [], N = K.keySet, w = z._zod, M = w.def.type;
    for (let R of Object.keys(U)) {
      if (N.has(R)) continue;
      if (M === "never") {
        q.push(R);
        continue;
      }
      let S = w.run({ value: U[R], issues: [] }, L);
      if (S instanceof Promise) F.push(S.then((C) => v4(C, V, R)));
      else v4(S, V, R);
    }
    if (q.length) V.issues.push({ code: "unrecognized_keys", keys: q, input: U, inst: X });
    if (!F.length) return V;
    return Promise.all(F).then(() => {
      return V;
    });
  };
});
function NJ(X, Q, $, Y) {
  for (let W of X) if (W.issues.length === 0) return Q.value = W.value, Q;
  return Q.issues.push({ code: "invalid_union", input: Q.value, inst: $, errors: X.map((W) => W.issues.map((J) => o0(J, Y, u0()))) }), Q;
}
var x4 = O("$ZodUnion", (X, Q) => {
  X0.init(X, Q), Y0(X._zod, "optin", () => Q.options.some(($) => $._zod.optin === "optional") ? "optional" : void 0), Y0(X._zod, "optout", () => Q.options.some(($) => $._zod.optout === "optional") ? "optional" : void 0), Y0(X._zod, "values", () => {
    if (Q.options.every(($) => $._zod.values)) return new Set(Q.options.flatMap(($) => Array.from($._zod.values)));
    return;
  }), Y0(X._zod, "pattern", () => {
    if (Q.options.every(($) => $._zod.pattern)) {
      let $ = Q.options.map((Y) => Y._zod.pattern);
      return new RegExp(`^(${$.map((Y) => AX(Y.source)).join("|")})$`);
    }
    return;
  }), X._zod.parse = ($, Y) => {
    let W = false, J = [];
    for (let G of Q.options) {
      let H = G._zod.run({ value: $.value, issues: [] }, Y);
      if (H instanceof Promise) J.push(H), W = true;
      else {
        if (H.issues.length === 0) return H;
        J.push(H);
      }
    }
    if (!W) return NJ(J, $, X, Y);
    return Promise.all(J).then((G) => {
      return NJ(G, $, X, Y);
    });
  };
});
var qQ = O("$ZodDiscriminatedUnion", (X, Q) => {
  x4.init(X, Q);
  let $ = X._zod.parse;
  Y0(X._zod, "propValues", () => {
    let W = {};
    for (let J of Q.options) {
      let G = J._zod.propValues;
      if (!G || Object.keys(G).length === 0) throw Error(`Invalid discriminated union option at index "${Q.options.indexOf(J)}"`);
      for (let [H, B] of Object.entries(G)) {
        if (!W[H]) W[H] = /* @__PURE__ */ new Set();
        for (let z of B) W[H].add(z);
      }
    }
    return W;
  });
  let Y = DX(() => {
    let W = Q.options, J = /* @__PURE__ */ new Map();
    for (let G of W) {
      let H = G._zod.propValues[Q.discriminator];
      if (!H || H.size === 0) throw Error(`Invalid discriminated union option at index "${Q.options.indexOf(G)}"`);
      for (let B of H) {
        if (J.has(B)) throw Error(`Duplicate discriminator value "${String(B)}"`);
        J.set(B, G);
      }
    }
    return J;
  });
  X._zod.parse = (W, J) => {
    let G = W.value;
    if (!C6(G)) return W.issues.push({ code: "invalid_type", expected: "object", input: G, inst: X }), W;
    let H = Y.value.get(G?.[Q.discriminator]);
    if (H) return H._zod.run(W, J);
    if (Q.unionFallback) return $(W, J);
    return W.issues.push({ code: "invalid_union", errors: [], note: "No matching discriminator", input: G, path: [Q.discriminator], inst: X }), W;
  };
});
var FQ = O("$ZodIntersection", (X, Q) => {
  X0.init(X, Q), X._zod.parse = ($, Y) => {
    let W = $.value, J = Q.left._zod.run({ value: W, issues: [] }, Y), G = Q.right._zod.run({ value: W, issues: [] }, Y);
    if (J instanceof Promise || G instanceof Promise) return Promise.all([J, G]).then(([B, z]) => {
      return OJ($, B, z);
    });
    return OJ($, J, G);
  };
});
function m9(X, Q) {
  if (X === Q) return { valid: true, data: X };
  if (X instanceof Date && Q instanceof Date && +X === +Q) return { valid: true, data: X };
  if (k6(X) && k6(Q)) {
    let $ = Object.keys(Q), Y = Object.keys(X).filter((J) => $.indexOf(J) !== -1), W = { ...X, ...Q };
    for (let J of Y) {
      let G = m9(X[J], Q[J]);
      if (!G.valid) return { valid: false, mergeErrorPath: [J, ...G.mergeErrorPath] };
      W[J] = G.data;
    }
    return { valid: true, data: W };
  }
  if (Array.isArray(X) && Array.isArray(Q)) {
    if (X.length !== Q.length) return { valid: false, mergeErrorPath: [] };
    let $ = [];
    for (let Y = 0; Y < X.length; Y++) {
      let W = X[Y], J = Q[Y], G = m9(W, J);
      if (!G.valid) return { valid: false, mergeErrorPath: [Y, ...G.mergeErrorPath] };
      $.push(G.data);
    }
    return { valid: true, data: $ };
  }
  return { valid: false, mergeErrorPath: [] };
}
function OJ(X, Q, $) {
  if (Q.issues.length) X.issues.push(...Q.issues);
  if ($.issues.length) X.issues.push(...$.issues);
  if (Q6(X)) return X;
  let Y = m9(Q.value, $.value);
  if (!Y.valid) throw Error(`Unmergable intersection. Error path: ${JSON.stringify(Y.mergeErrorPath)}`);
  return X.value = Y.data, X;
}
var NQ = O("$ZodRecord", (X, Q) => {
  X0.init(X, Q), X._zod.parse = ($, Y) => {
    let W = $.value;
    if (!k6(W)) return $.issues.push({ expected: "record", code: "invalid_type", input: W, inst: X }), $;
    let J = [];
    if (Q.keyType._zod.values) {
      let G = Q.keyType._zod.values;
      $.value = {};
      for (let B of G) if (typeof B === "string" || typeof B === "number" || typeof B === "symbol") {
        let z = Q.valueType._zod.run({ value: W[B], issues: [] }, Y);
        if (z instanceof Promise) J.push(z.then((K) => {
          if (K.issues.length) $.issues.push(...H1(B, K.issues));
          $.value[B] = K.value;
        }));
        else {
          if (z.issues.length) $.issues.push(...H1(B, z.issues));
          $.value[B] = z.value;
        }
      }
      let H;
      for (let B in W) if (!G.has(B)) H = H ?? [], H.push(B);
      if (H && H.length > 0) $.issues.push({ code: "unrecognized_keys", input: W, inst: X, keys: H });
    } else {
      $.value = {};
      for (let G of Reflect.ownKeys(W)) {
        if (G === "__proto__") continue;
        let H = Q.keyType._zod.run({ value: G, issues: [] }, Y);
        if (H instanceof Promise) throw Error("Async schemas not supported in object keys currently");
        if (H.issues.length) {
          $.issues.push({ origin: "record", code: "invalid_key", issues: H.issues.map((z) => o0(z, Y, u0())), input: G, path: [G], inst: X }), $.value[H.value] = H.value;
          continue;
        }
        let B = Q.valueType._zod.run({ value: W[G], issues: [] }, Y);
        if (B instanceof Promise) J.push(B.then((z) => {
          if (z.issues.length) $.issues.push(...H1(G, z.issues));
          $.value[H.value] = z.value;
        }));
        else {
          if (B.issues.length) $.issues.push(...H1(G, B.issues));
          $.value[H.value] = B.value;
        }
      }
    }
    if (J.length) return Promise.all(J).then(() => $);
    return $;
  };
});
var OQ = O("$ZodEnum", (X, Q) => {
  X0.init(X, Q);
  let $ = OX(Q.entries);
  X._zod.values = new Set($), X._zod.pattern = new RegExp(`^(${$.filter((Y) => E9.has(typeof Y)).map((Y) => typeof Y === "string" ? y1(Y) : Y.toString()).join("|")})$`), X._zod.parse = (Y, W) => {
    let J = Y.value;
    if (X._zod.values.has(J)) return Y;
    return Y.issues.push({ code: "invalid_value", values: $, input: J, inst: X }), Y;
  };
});
var DQ = O("$ZodLiteral", (X, Q) => {
  X0.init(X, Q), X._zod.values = new Set(Q.values), X._zod.pattern = new RegExp(`^(${Q.values.map(($) => typeof $ === "string" ? y1($) : $ ? $.toString() : String($)).join("|")})$`), X._zod.parse = ($, Y) => {
    let W = $.value;
    if (X._zod.values.has(W)) return $;
    return $.issues.push({ code: "invalid_value", values: Q.values, input: W, inst: X }), $;
  };
});
var wQ = O("$ZodTransform", (X, Q) => {
  X0.init(X, Q), X._zod.parse = ($, Y) => {
    let W = Q.transform($.value, $);
    if (Y.async) return (W instanceof Promise ? W : Promise.resolve(W)).then((G) => {
      return $.value = G, $;
    });
    if (W instanceof Promise) throw new x1();
    return $.value = W, $;
  };
});
var AQ = O("$ZodOptional", (X, Q) => {
  X0.init(X, Q), X._zod.optin = "optional", X._zod.optout = "optional", Y0(X._zod, "values", () => {
    return Q.innerType._zod.values ? /* @__PURE__ */ new Set([...Q.innerType._zod.values, void 0]) : void 0;
  }), Y0(X._zod, "pattern", () => {
    let $ = Q.innerType._zod.pattern;
    return $ ? new RegExp(`^(${AX($.source)})?$`) : void 0;
  }), X._zod.parse = ($, Y) => {
    if (Q.innerType._zod.optin === "optional") return Q.innerType._zod.run($, Y);
    if ($.value === void 0) return $;
    return Q.innerType._zod.run($, Y);
  };
});
var MQ = O("$ZodNullable", (X, Q) => {
  X0.init(X, Q), Y0(X._zod, "optin", () => Q.innerType._zod.optin), Y0(X._zod, "optout", () => Q.innerType._zod.optout), Y0(X._zod, "pattern", () => {
    let $ = Q.innerType._zod.pattern;
    return $ ? new RegExp(`^(${AX($.source)}|null)$`) : void 0;
  }), Y0(X._zod, "values", () => {
    return Q.innerType._zod.values ? /* @__PURE__ */ new Set([...Q.innerType._zod.values, null]) : void 0;
  }), X._zod.parse = ($, Y) => {
    if ($.value === null) return $;
    return Q.innerType._zod.run($, Y);
  };
});
var jQ = O("$ZodDefault", (X, Q) => {
  X0.init(X, Q), X._zod.optin = "optional", Y0(X._zod, "values", () => Q.innerType._zod.values), X._zod.parse = ($, Y) => {
    if ($.value === void 0) return $.value = Q.defaultValue, $;
    let W = Q.innerType._zod.run($, Y);
    if (W instanceof Promise) return W.then((J) => DJ(J, Q));
    return DJ(W, Q);
  };
});
function DJ(X, Q) {
  if (X.value === void 0) X.value = Q.defaultValue;
  return X;
}
var RQ = O("$ZodPrefault", (X, Q) => {
  X0.init(X, Q), X._zod.optin = "optional", Y0(X._zod, "values", () => Q.innerType._zod.values), X._zod.parse = ($, Y) => {
    if ($.value === void 0) $.value = Q.defaultValue;
    return Q.innerType._zod.run($, Y);
  };
});
var IQ = O("$ZodNonOptional", (X, Q) => {
  X0.init(X, Q), Y0(X._zod, "values", () => {
    let $ = Q.innerType._zod.values;
    return $ ? new Set([...$].filter((Y) => Y !== void 0)) : void 0;
  }), X._zod.parse = ($, Y) => {
    let W = Q.innerType._zod.run($, Y);
    if (W instanceof Promise) return W.then((J) => wJ(J, X));
    return wJ(W, X);
  };
});
function wJ(X, Q) {
  if (!X.issues.length && X.value === void 0) X.issues.push({ code: "invalid_type", expected: "nonoptional", input: X.value, inst: Q });
  return X;
}
var EQ = O("$ZodCatch", (X, Q) => {
  X0.init(X, Q), X._zod.optin = "optional", Y0(X._zod, "optout", () => Q.innerType._zod.optout), Y0(X._zod, "values", () => Q.innerType._zod.values), X._zod.parse = ($, Y) => {
    let W = Q.innerType._zod.run($, Y);
    if (W instanceof Promise) return W.then((J) => {
      if ($.value = J.value, J.issues.length) $.value = Q.catchValue({ ...$, error: { issues: J.issues.map((G) => o0(G, Y, u0())) }, input: $.value }), $.issues = [];
      return $;
    });
    if ($.value = W.value, W.issues.length) $.value = Q.catchValue({ ...$, error: { issues: W.issues.map((J) => o0(J, Y, u0())) }, input: $.value }), $.issues = [];
    return $;
  };
});
var bQ = O("$ZodPipe", (X, Q) => {
  X0.init(X, Q), Y0(X._zod, "values", () => Q.in._zod.values), Y0(X._zod, "optin", () => Q.in._zod.optin), Y0(X._zod, "optout", () => Q.out._zod.optout), X._zod.parse = ($, Y) => {
    let W = Q.in._zod.run($, Y);
    if (W instanceof Promise) return W.then((J) => AJ(J, Q, Y));
    return AJ(W, Q, Y);
  };
});
function AJ(X, Q, $) {
  if (Q6(X)) return X;
  return Q.out._zod.run({ value: X.value, issues: X.issues }, $);
}
var PQ = O("$ZodReadonly", (X, Q) => {
  X0.init(X, Q), Y0(X._zod, "propValues", () => Q.innerType._zod.propValues), Y0(X._zod, "values", () => Q.innerType._zod.values), Y0(X._zod, "optin", () => Q.innerType._zod.optin), Y0(X._zod, "optout", () => Q.innerType._zod.optout), X._zod.parse = ($, Y) => {
    let W = Q.innerType._zod.run($, Y);
    if (W instanceof Promise) return W.then(MJ);
    return MJ(W);
  };
});
function MJ(X) {
  return X.value = Object.freeze(X.value), X;
}
var SQ = O("$ZodCustom", (X, Q) => {
  A0.init(X, Q), X0.init(X, Q), X._zod.parse = ($, Y) => {
    return $;
  }, X._zod.check = ($) => {
    let Y = $.value, W = Q.fn(Y);
    if (W instanceof Promise) return W.then((J) => jJ(J, $, Y, X));
    jJ(W, $, Y, X);
    return;
  };
});
function jJ(X, Q, $, Y) {
  if (!X) {
    let W = { code: "custom", input: $, inst: Y, path: [...Y._zod.def.path ?? []], continue: !Y._zod.def.abort };
    if (Y._zod.def.params) W.params = Y._zod.def.params;
    Q.issues.push(S9(W));
  }
}
var QL = (X) => {
  let Q = typeof X;
  switch (Q) {
    case "number":
      return Number.isNaN(X) ? "NaN" : "number";
    case "object": {
      if (Array.isArray(X)) return "array";
      if (X === null) return "null";
      if (Object.getPrototypeOf(X) !== Object.prototype && X.constructor) return X.constructor.name;
    }
  }
  return Q;
};
var $L = () => {
  let X = { string: { unit: "characters", verb: "to have" }, file: { unit: "bytes", verb: "to have" }, array: { unit: "items", verb: "to have" }, set: { unit: "items", verb: "to have" } };
  function Q(Y) {
    return X[Y] ?? null;
  }
  let $ = { regex: "input", email: "email address", url: "URL", emoji: "emoji", uuid: "UUID", uuidv4: "UUIDv4", uuidv6: "UUIDv6", nanoid: "nanoid", guid: "GUID", cuid: "cuid", cuid2: "cuid2", ulid: "ULID", xid: "XID", ksuid: "KSUID", datetime: "ISO datetime", date: "ISO date", time: "ISO time", duration: "ISO duration", ipv4: "IPv4 address", ipv6: "IPv6 address", cidrv4: "IPv4 range", cidrv6: "IPv6 range", base64: "base64-encoded string", base64url: "base64url-encoded string", json_string: "JSON string", e164: "E.164 number", jwt: "JWT", template_literal: "input" };
  return (Y) => {
    switch (Y.code) {
      case "invalid_type":
        return `Invalid input: expected ${Y.expected}, received ${QL(Y.input)}`;
      case "invalid_value":
        if (Y.values.length === 1) return `Invalid input: expected ${Z4(Y.values[0])}`;
        return `Invalid option: expected one of ${P4(Y.values, "|")}`;
      case "too_big": {
        let W = Y.inclusive ? "<=" : "<", J = Q(Y.origin);
        if (J) return `Too big: expected ${Y.origin ?? "value"} to have ${W}${Y.maximum.toString()} ${J.unit ?? "elements"}`;
        return `Too big: expected ${Y.origin ?? "value"} to be ${W}${Y.maximum.toString()}`;
      }
      case "too_small": {
        let W = Y.inclusive ? ">=" : ">", J = Q(Y.origin);
        if (J) return `Too small: expected ${Y.origin} to have ${W}${Y.minimum.toString()} ${J.unit}`;
        return `Too small: expected ${Y.origin} to be ${W}${Y.minimum.toString()}`;
      }
      case "invalid_format": {
        let W = Y;
        if (W.format === "starts_with") return `Invalid string: must start with "${W.prefix}"`;
        if (W.format === "ends_with") return `Invalid string: must end with "${W.suffix}"`;
        if (W.format === "includes") return `Invalid string: must include "${W.includes}"`;
        if (W.format === "regex") return `Invalid string: must match pattern ${W.pattern}`;
        return `Invalid ${$[W.format] ?? Y.format}`;
      }
      case "not_multiple_of":
        return `Invalid number: must be a multiple of ${Y.divisor}`;
      case "unrecognized_keys":
        return `Unrecognized key${Y.keys.length > 1 ? "s" : ""}: ${P4(Y.keys, ", ")}`;
      case "invalid_key":
        return `Invalid key in ${Y.origin}`;
      case "invalid_union":
        return "Invalid input";
      case "invalid_element":
        return `Invalid value in ${Y.origin}`;
      default:
        return "Invalid input";
    }
  };
};
function ZQ() {
  return { localeError: $L() };
}
var y4 = class {
  constructor() {
    this._map = /* @__PURE__ */ new WeakMap(), this._idmap = /* @__PURE__ */ new Map();
  }
  add(X, ...Q) {
    let $ = Q[0];
    if (this._map.set(X, $), $ && typeof $ === "object" && "id" in $) {
      if (this._idmap.has($.id)) throw Error(`ID ${$.id} already exists in the registry`);
      this._idmap.set($.id, X);
    }
    return this;
  }
  remove(X) {
    return this._map.delete(X), this;
  }
  get(X) {
    let Q = X._zod.parent;
    if (Q) {
      let $ = { ...this.get(Q) ?? {} };
      return delete $.id, { ...$, ...this._map.get(X) };
    }
    return this._map.get(X);
  }
  has(X) {
    return this._map.has(X);
  }
};
function SJ() {
  return new y4();
}
var g1 = SJ();
function CQ(X, Q) {
  return new X({ type: "string", ...y(Q) });
}
function kQ(X, Q) {
  return new X({ type: "string", format: "email", check: "string_format", abort: false, ...y(Q) });
}
function g4(X, Q) {
  return new X({ type: "string", format: "guid", check: "string_format", abort: false, ...y(Q) });
}
function vQ(X, Q) {
  return new X({ type: "string", format: "uuid", check: "string_format", abort: false, ...y(Q) });
}
function TQ(X, Q) {
  return new X({ type: "string", format: "uuid", check: "string_format", abort: false, version: "v4", ...y(Q) });
}
function _Q(X, Q) {
  return new X({ type: "string", format: "uuid", check: "string_format", abort: false, version: "v6", ...y(Q) });
}
function xQ(X, Q) {
  return new X({ type: "string", format: "uuid", check: "string_format", abort: false, version: "v7", ...y(Q) });
}
function yQ(X, Q) {
  return new X({ type: "string", format: "url", check: "string_format", abort: false, ...y(Q) });
}
function gQ(X, Q) {
  return new X({ type: "string", format: "emoji", check: "string_format", abort: false, ...y(Q) });
}
function fQ(X, Q) {
  return new X({ type: "string", format: "nanoid", check: "string_format", abort: false, ...y(Q) });
}
function hQ(X, Q) {
  return new X({ type: "string", format: "cuid", check: "string_format", abort: false, ...y(Q) });
}
function uQ(X, Q) {
  return new X({ type: "string", format: "cuid2", check: "string_format", abort: false, ...y(Q) });
}
function lQ(X, Q) {
  return new X({ type: "string", format: "ulid", check: "string_format", abort: false, ...y(Q) });
}
function mQ(X, Q) {
  return new X({ type: "string", format: "xid", check: "string_format", abort: false, ...y(Q) });
}
function cQ(X, Q) {
  return new X({ type: "string", format: "ksuid", check: "string_format", abort: false, ...y(Q) });
}
function pQ(X, Q) {
  return new X({ type: "string", format: "ipv4", check: "string_format", abort: false, ...y(Q) });
}
function dQ(X, Q) {
  return new X({ type: "string", format: "ipv6", check: "string_format", abort: false, ...y(Q) });
}
function iQ(X, Q) {
  return new X({ type: "string", format: "cidrv4", check: "string_format", abort: false, ...y(Q) });
}
function nQ(X, Q) {
  return new X({ type: "string", format: "cidrv6", check: "string_format", abort: false, ...y(Q) });
}
function rQ(X, Q) {
  return new X({ type: "string", format: "base64", check: "string_format", abort: false, ...y(Q) });
}
function oQ(X, Q) {
  return new X({ type: "string", format: "base64url", check: "string_format", abort: false, ...y(Q) });
}
function tQ(X, Q) {
  return new X({ type: "string", format: "e164", check: "string_format", abort: false, ...y(Q) });
}
function aQ(X, Q) {
  return new X({ type: "string", format: "jwt", check: "string_format", abort: false, ...y(Q) });
}
function ZJ(X, Q) {
  return new X({ type: "string", format: "datetime", check: "string_format", offset: false, local: false, precision: null, ...y(Q) });
}
function CJ(X, Q) {
  return new X({ type: "string", format: "date", check: "string_format", ...y(Q) });
}
function kJ(X, Q) {
  return new X({ type: "string", format: "time", check: "string_format", precision: null, ...y(Q) });
}
function vJ(X, Q) {
  return new X({ type: "string", format: "duration", check: "string_format", ...y(Q) });
}
function sQ(X, Q) {
  return new X({ type: "number", checks: [], ...y(Q) });
}
function eQ(X, Q) {
  return new X({ type: "number", check: "number_format", abort: false, format: "safeint", ...y(Q) });
}
function X$(X, Q) {
  return new X({ type: "boolean", ...y(Q) });
}
function Q$(X, Q) {
  return new X({ type: "null", ...y(Q) });
}
function $$(X) {
  return new X({ type: "unknown" });
}
function Y$(X, Q) {
  return new X({ type: "never", ...y(Q) });
}
function f4(X, Q) {
  return new h9({ check: "less_than", ...y(Q), value: X, inclusive: false });
}
function EX(X, Q) {
  return new h9({ check: "less_than", ...y(Q), value: X, inclusive: true });
}
function h4(X, Q) {
  return new u9({ check: "greater_than", ...y(Q), value: X, inclusive: false });
}
function bX(X, Q) {
  return new u9({ check: "greater_than", ...y(Q), value: X, inclusive: true });
}
function u4(X, Q) {
  return new XJ({ check: "multiple_of", ...y(Q), value: X });
}
function l4(X, Q) {
  return new $J({ check: "max_length", ...y(Q), maximum: X });
}
function v6(X, Q) {
  return new YJ({ check: "min_length", ...y(Q), minimum: X });
}
function m4(X, Q) {
  return new WJ({ check: "length_equals", ...y(Q), length: X });
}
function W$(X, Q) {
  return new JJ({ check: "string_format", format: "regex", ...y(Q), pattern: X });
}
function J$(X) {
  return new GJ({ check: "string_format", format: "lowercase", ...y(X) });
}
function G$(X) {
  return new HJ({ check: "string_format", format: "uppercase", ...y(X) });
}
function H$(X, Q) {
  return new BJ({ check: "string_format", format: "includes", ...y(Q), includes: X });
}
function B$(X, Q) {
  return new zJ({ check: "string_format", format: "starts_with", ...y(Q), prefix: X });
}
function z$(X, Q) {
  return new KJ({ check: "string_format", format: "ends_with", ...y(Q), suffix: X });
}
function W6(X) {
  return new UJ({ check: "overwrite", tx: X });
}
function K$(X) {
  return W6((Q) => Q.normalize(X));
}
function U$() {
  return W6((X) => X.trim());
}
function V$() {
  return W6((X) => X.toLowerCase());
}
function L$() {
  return W6((X) => X.toUpperCase());
}
function TJ(X, Q, $) {
  return new X({ type: "array", element: Q, ...y($) });
}
function q$(X, Q, $) {
  let Y = y($);
  return Y.abort ?? (Y.abort = true), new X({ type: "custom", check: "custom", fn: Q, ...Y });
}
function F$(X, Q, $) {
  return new X({ type: "custom", check: "custom", fn: Q, ...y($) });
}
var hL = O("ZodMiniType", (X, Q) => {
  if (!X._zod) throw Error("Uninitialized schema in ZodMiniType.");
  X0.init(X, Q), X.def = Q, X.parse = ($, Y) => v9(X, $, Y, { callee: X.parse }), X.safeParse = ($, Y) => $6(X, $, Y), X.parseAsync = async ($, Y) => _9(X, $, Y, { callee: X.parseAsync }), X.safeParseAsync = async ($, Y) => Y6(X, $, Y), X.check = (...$) => {
    return X.clone({ ...Q, checks: [...Q.checks ?? [], ...$.map((Y) => typeof Y === "function" ? { _zod: { check: Y, def: { check: "custom" }, onattach: [] } } : Y)] });
  }, X.clone = ($, Y) => l0(X, $, Y), X.brand = () => X, X.register = ($, Y) => {
    return $.add(X, Y), X;
  };
});
var uL = O("ZodMiniObject", (X, Q) => {
  _4.init(X, Q), hL.init(X, Q), i.defineLazy(X, "shape", () => Q.shape);
});
var PX = {};
V7(PX, { time: () => M$, duration: () => j$, datetime: () => w$, date: () => A$, ZodISOTime: () => hJ, ZodISODuration: () => uJ, ZodISODateTime: () => gJ, ZodISODate: () => fJ });
var gJ = O("ZodISODateTime", (X, Q) => {
  RJ.init(X, Q), H0.init(X, Q);
});
function w$(X) {
  return ZJ(gJ, X);
}
var fJ = O("ZodISODate", (X, Q) => {
  IJ.init(X, Q), H0.init(X, Q);
});
function A$(X) {
  return CJ(fJ, X);
}
var hJ = O("ZodISOTime", (X, Q) => {
  EJ.init(X, Q), H0.init(X, Q);
});
function M$(X) {
  return kJ(hJ, X);
}
var uJ = O("ZodISODuration", (X, Q) => {
  bJ.init(X, Q), H0.init(X, Q);
});
function j$(X) {
  return vJ(uJ, X);
}
var lJ = (X, Q) => {
  C4.init(X, Q), X.name = "ZodError", Object.defineProperties(X, { format: { value: ($) => C9(X, $) }, flatten: { value: ($) => Z9(X, $) }, addIssue: { value: ($) => X.issues.push($) }, addIssues: { value: ($) => X.issues.push(...$) }, isEmpty: { get() {
    return X.issues.length === 0;
  } } });
};
var KZ = O("ZodError", lJ);
var SX = O("ZodError", lJ, { Parent: Error });
var mJ = k9(SX);
var cJ = T9(SX);
var pJ = x9(SX);
var dJ = y9(SX);
var z0 = O("ZodType", (X, Q) => {
  return X0.init(X, Q), X.def = Q, Object.defineProperty(X, "_def", { value: Q }), X.check = (...$) => {
    return X.clone({ ...Q, checks: [...Q.checks ?? [], ...$.map((Y) => typeof Y === "function" ? { _zod: { check: Y, def: { check: "custom" }, onattach: [] } } : Y)] });
  }, X.clone = ($, Y) => l0(X, $, Y), X.brand = () => X, X.register = ($, Y) => {
    return $.add(X, Y), X;
  }, X.parse = ($, Y) => mJ(X, $, Y, { callee: X.parse }), X.safeParse = ($, Y) => pJ(X, $, Y), X.parseAsync = async ($, Y) => cJ(X, $, Y, { callee: X.parseAsync }), X.safeParseAsync = async ($, Y) => dJ(X, $, Y), X.spa = X.safeParseAsync, X.refine = ($, Y) => X.check(gq($, Y)), X.superRefine = ($) => X.check(fq($)), X.overwrite = ($) => X.check(W6($)), X.optional = () => v(X), X.nullable = () => rJ(X), X.nullish = () => v(rJ(X)), X.nonoptional = ($) => Cq(X, $), X.array = () => r(X), X.or = ($) => J0([X, $]), X.and = ($) => n4(X, $), X.transform = ($) => I$(X, eJ($)), X.default = ($) => Pq(X, $), X.prefault = ($) => Zq(X, $), X.catch = ($) => vq(X, $), X.pipe = ($) => I$(X, $), X.readonly = () => xq(X), X.describe = ($) => {
    let Y = X.clone();
    return g1.add(Y, { description: $ }), Y;
  }, Object.defineProperty(X, "description", { get() {
    return g1.get(X)?.description;
  }, configurable: true }), X.meta = (...$) => {
    if ($.length === 0) return g1.get(X);
    let Y = X.clone();
    return g1.add(Y, $[0]), Y;
  }, X.isOptional = () => X.safeParse(void 0).success, X.isNullable = () => X.safeParse(null).success, X;
});
var oJ = O("_ZodString", (X, Q) => {
  IX.init(X, Q), z0.init(X, Q);
  let $ = X._zod.bag;
  X.format = $.format ?? null, X.minLength = $.minimum ?? null, X.maxLength = $.maximum ?? null, X.regex = (...Y) => X.check(W$(...Y)), X.includes = (...Y) => X.check(H$(...Y)), X.startsWith = (...Y) => X.check(B$(...Y)), X.endsWith = (...Y) => X.check(z$(...Y)), X.min = (...Y) => X.check(v6(...Y)), X.max = (...Y) => X.check(l4(...Y)), X.length = (...Y) => X.check(m4(...Y)), X.nonempty = (...Y) => X.check(v6(1, ...Y)), X.lowercase = (Y) => X.check(J$(Y)), X.uppercase = (Y) => X.check(G$(Y)), X.trim = () => X.check(U$()), X.normalize = (...Y) => X.check(K$(...Y)), X.toLowerCase = () => X.check(V$()), X.toUpperCase = () => X.check(L$());
});
var oL = O("ZodString", (X, Q) => {
  IX.init(X, Q), oJ.init(X, Q), X.email = ($) => X.check(kQ(tL, $)), X.url = ($) => X.check(yQ(aL, $)), X.jwt = ($) => X.check(aQ(Vq, $)), X.emoji = ($) => X.check(gQ(sL, $)), X.guid = ($) => X.check(g4(iJ, $)), X.uuid = ($) => X.check(vQ(i4, $)), X.uuidv4 = ($) => X.check(TQ(i4, $)), X.uuidv6 = ($) => X.check(_Q(i4, $)), X.uuidv7 = ($) => X.check(xQ(i4, $)), X.nanoid = ($) => X.check(fQ(eL, $)), X.guid = ($) => X.check(g4(iJ, $)), X.cuid = ($) => X.check(hQ(Xq, $)), X.cuid2 = ($) => X.check(uQ(Qq, $)), X.ulid = ($) => X.check(lQ($q, $)), X.base64 = ($) => X.check(rQ(zq, $)), X.base64url = ($) => X.check(oQ(Kq, $)), X.xid = ($) => X.check(mQ(Yq, $)), X.ksuid = ($) => X.check(cQ(Wq, $)), X.ipv4 = ($) => X.check(pQ(Jq, $)), X.ipv6 = ($) => X.check(dQ(Gq, $)), X.cidrv4 = ($) => X.check(iQ(Hq, $)), X.cidrv6 = ($) => X.check(nQ(Bq, $)), X.e164 = ($) => X.check(tQ(Uq, $)), X.datetime = ($) => X.check(w$($)), X.date = ($) => X.check(A$($)), X.time = ($) => X.check(M$($)), X.duration = ($) => X.check(j$($));
});
function D(X) {
  return CQ(oL, X);
}
var H0 = O("ZodStringFormat", (X, Q) => {
  W0.init(X, Q), oJ.init(X, Q);
});
var tL = O("ZodEmail", (X, Q) => {
  d9.init(X, Q), H0.init(X, Q);
});
var iJ = O("ZodGUID", (X, Q) => {
  c9.init(X, Q), H0.init(X, Q);
});
var i4 = O("ZodUUID", (X, Q) => {
  p9.init(X, Q), H0.init(X, Q);
});
var aL = O("ZodURL", (X, Q) => {
  i9.init(X, Q), H0.init(X, Q);
});
var sL = O("ZodEmoji", (X, Q) => {
  n9.init(X, Q), H0.init(X, Q);
});
var eL = O("ZodNanoID", (X, Q) => {
  r9.init(X, Q), H0.init(X, Q);
});
var Xq = O("ZodCUID", (X, Q) => {
  o9.init(X, Q), H0.init(X, Q);
});
var Qq = O("ZodCUID2", (X, Q) => {
  t9.init(X, Q), H0.init(X, Q);
});
var $q = O("ZodULID", (X, Q) => {
  a9.init(X, Q), H0.init(X, Q);
});
var Yq = O("ZodXID", (X, Q) => {
  s9.init(X, Q), H0.init(X, Q);
});
var Wq = O("ZodKSUID", (X, Q) => {
  e9.init(X, Q), H0.init(X, Q);
});
var Jq = O("ZodIPv4", (X, Q) => {
  XQ.init(X, Q), H0.init(X, Q);
});
var Gq = O("ZodIPv6", (X, Q) => {
  QQ.init(X, Q), H0.init(X, Q);
});
var Hq = O("ZodCIDRv4", (X, Q) => {
  $Q.init(X, Q), H0.init(X, Q);
});
var Bq = O("ZodCIDRv6", (X, Q) => {
  YQ.init(X, Q), H0.init(X, Q);
});
var zq = O("ZodBase64", (X, Q) => {
  WQ.init(X, Q), H0.init(X, Q);
});
var Kq = O("ZodBase64URL", (X, Q) => {
  JQ.init(X, Q), H0.init(X, Q);
});
var Uq = O("ZodE164", (X, Q) => {
  GQ.init(X, Q), H0.init(X, Q);
});
var Vq = O("ZodJWT", (X, Q) => {
  HQ.init(X, Q), H0.init(X, Q);
});
var tJ = O("ZodNumber", (X, Q) => {
  T4.init(X, Q), z0.init(X, Q), X.gt = (Y, W) => X.check(h4(Y, W)), X.gte = (Y, W) => X.check(bX(Y, W)), X.min = (Y, W) => X.check(bX(Y, W)), X.lt = (Y, W) => X.check(f4(Y, W)), X.lte = (Y, W) => X.check(EX(Y, W)), X.max = (Y, W) => X.check(EX(Y, W)), X.int = (Y) => X.check(nJ(Y)), X.safe = (Y) => X.check(nJ(Y)), X.positive = (Y) => X.check(h4(0, Y)), X.nonnegative = (Y) => X.check(bX(0, Y)), X.negative = (Y) => X.check(f4(0, Y)), X.nonpositive = (Y) => X.check(EX(0, Y)), X.multipleOf = (Y, W) => X.check(u4(Y, W)), X.step = (Y, W) => X.check(u4(Y, W)), X.finite = () => X;
  let $ = X._zod.bag;
  X.minValue = Math.max($.minimum ?? Number.NEGATIVE_INFINITY, $.exclusiveMinimum ?? Number.NEGATIVE_INFINITY) ?? null, X.maxValue = Math.min($.maximum ?? Number.POSITIVE_INFINITY, $.exclusiveMaximum ?? Number.POSITIVE_INFINITY) ?? null, X.isInt = ($.format ?? "").includes("int") || Number.isSafeInteger($.multipleOf ?? 0.5), X.isFinite = true, X.format = $.format ?? null;
});
function Q0(X) {
  return sQ(tJ, X);
}
var Lq = O("ZodNumberFormat", (X, Q) => {
  BQ.init(X, Q), tJ.init(X, Q);
});
function nJ(X) {
  return eQ(Lq, X);
}
var qq = O("ZodBoolean", (X, Q) => {
  zQ.init(X, Q), z0.init(X, Q);
});
function M0(X) {
  return X$(qq, X);
}
var Fq = O("ZodNull", (X, Q) => {
  KQ.init(X, Q), z0.init(X, Q);
});
function E$(X) {
  return Q$(Fq, X);
}
var Nq = O("ZodUnknown", (X, Q) => {
  UQ.init(X, Q), z0.init(X, Q);
});
function N0() {
  return $$(Nq);
}
var Oq = O("ZodNever", (X, Q) => {
  VQ.init(X, Q), z0.init(X, Q);
});
function Dq(X) {
  return Y$(Oq, X);
}
var wq = O("ZodArray", (X, Q) => {
  LQ.init(X, Q), z0.init(X, Q), X.element = Q.element, X.min = ($, Y) => X.check(v6($, Y)), X.nonempty = ($) => X.check(v6(1, $)), X.max = ($, Y) => X.check(l4($, Y)), X.length = ($, Y) => X.check(m4($, Y)), X.unwrap = () => X.element;
});
function r(X, Q) {
  return TJ(wq, X, Q);
}
var aJ = O("ZodObject", (X, Q) => {
  _4.init(X, Q), z0.init(X, Q), i.defineLazy(X, "shape", () => Q.shape), X.keyof = () => j0(Object.keys(X._zod.def.shape)), X.catchall = ($) => X.clone({ ...X._zod.def, catchall: $ }), X.passthrough = () => X.clone({ ...X._zod.def, catchall: N0() }), X.loose = () => X.clone({ ...X._zod.def, catchall: N0() }), X.strict = () => X.clone({ ...X._zod.def, catchall: Dq() }), X.strip = () => X.clone({ ...X._zod.def, catchall: void 0 }), X.extend = ($) => {
    return i.extend(X, $);
  }, X.merge = ($) => i.merge(X, $), X.pick = ($) => i.pick(X, $), X.omit = ($) => i.omit(X, $), X.partial = (...$) => i.partial(X5, X, $[0]), X.required = (...$) => i.required(Q5, X, $[0]);
});
function E(X, Q) {
  let $ = { type: "object", get shape() {
    return i.assignProp(this, "shape", { ...X }), this.shape;
  }, ...i.normalizeParams(Q) };
  return new aJ($);
}
function c0(X, Q) {
  return new aJ({ type: "object", get shape() {
    return i.assignProp(this, "shape", { ...X }), this.shape;
  }, catchall: N0(), ...i.normalizeParams(Q) });
}
var sJ = O("ZodUnion", (X, Q) => {
  x4.init(X, Q), z0.init(X, Q), X.options = Q.options;
});
function J0(X, Q) {
  return new sJ({ type: "union", options: X, ...i.normalizeParams(Q) });
}
var Aq = O("ZodDiscriminatedUnion", (X, Q) => {
  sJ.init(X, Q), qQ.init(X, Q);
});
function b$(X, Q, $) {
  return new Aq({ type: "union", options: Q, discriminator: X, ...i.normalizeParams($) });
}
var Mq = O("ZodIntersection", (X, Q) => {
  FQ.init(X, Q), z0.init(X, Q);
});
function n4(X, Q) {
  return new Mq({ type: "intersection", left: X, right: Q });
}
var jq = O("ZodRecord", (X, Q) => {
  NQ.init(X, Q), z0.init(X, Q), X.keyType = Q.keyType, X.valueType = Q.valueType;
});
function O0(X, Q, $) {
  return new jq({ type: "record", keyType: X, valueType: Q, ...i.normalizeParams($) });
}
var R$ = O("ZodEnum", (X, Q) => {
  OQ.init(X, Q), z0.init(X, Q), X.enum = Q.entries, X.options = Object.values(Q.entries);
  let $ = new Set(Object.keys(Q.entries));
  X.extract = (Y, W) => {
    let J = {};
    for (let G of Y) if ($.has(G)) J[G] = Q.entries[G];
    else throw Error(`Key ${G} not found in enum`);
    return new R$({ ...Q, checks: [], ...i.normalizeParams(W), entries: J });
  }, X.exclude = (Y, W) => {
    let J = { ...Q.entries };
    for (let G of Y) if ($.has(G)) delete J[G];
    else throw Error(`Key ${G} not found in enum`);
    return new R$({ ...Q, checks: [], ...i.normalizeParams(W), entries: J });
  };
});
function j0(X, Q) {
  let $ = Array.isArray(X) ? Object.fromEntries(X.map((Y) => [Y, Y])) : X;
  return new R$({ type: "enum", entries: $, ...i.normalizeParams(Q) });
}
var Rq = O("ZodLiteral", (X, Q) => {
  DQ.init(X, Q), z0.init(X, Q), X.values = new Set(Q.values), Object.defineProperty(X, "value", { get() {
    if (Q.values.length > 1) throw Error("This schema contains multiple valid literal values. Use `.values` instead.");
    return Q.values[0];
  } });
});
function T(X, Q) {
  return new Rq({ type: "literal", values: Array.isArray(X) ? X : [X], ...i.normalizeParams(Q) });
}
var Iq = O("ZodTransform", (X, Q) => {
  wQ.init(X, Q), z0.init(X, Q), X._zod.parse = ($, Y) => {
    $.addIssue = (J) => {
      if (typeof J === "string") $.issues.push(i.issue(J, $.value, Q));
      else {
        let G = J;
        if (G.fatal) G.continue = false;
        G.code ?? (G.code = "custom"), G.input ?? (G.input = $.value), G.inst ?? (G.inst = X), G.continue ?? (G.continue = true), $.issues.push(i.issue(G));
      }
    };
    let W = Q.transform($.value, $);
    if (W instanceof Promise) return W.then((J) => {
      return $.value = J, $;
    });
    return $.value = W, $;
  };
});
function eJ(X) {
  return new Iq({ type: "transform", transform: X });
}
var X5 = O("ZodOptional", (X, Q) => {
  AQ.init(X, Q), z0.init(X, Q), X.unwrap = () => X._zod.def.innerType;
});
function v(X) {
  return new X5({ type: "optional", innerType: X });
}
var Eq = O("ZodNullable", (X, Q) => {
  MQ.init(X, Q), z0.init(X, Q), X.unwrap = () => X._zod.def.innerType;
});
function rJ(X) {
  return new Eq({ type: "nullable", innerType: X });
}
var bq = O("ZodDefault", (X, Q) => {
  jQ.init(X, Q), z0.init(X, Q), X.unwrap = () => X._zod.def.innerType, X.removeDefault = X.unwrap;
});
function Pq(X, Q) {
  return new bq({ type: "default", innerType: X, get defaultValue() {
    return typeof Q === "function" ? Q() : Q;
  } });
}
var Sq = O("ZodPrefault", (X, Q) => {
  RQ.init(X, Q), z0.init(X, Q), X.unwrap = () => X._zod.def.innerType;
});
function Zq(X, Q) {
  return new Sq({ type: "prefault", innerType: X, get defaultValue() {
    return typeof Q === "function" ? Q() : Q;
  } });
}
var Q5 = O("ZodNonOptional", (X, Q) => {
  IQ.init(X, Q), z0.init(X, Q), X.unwrap = () => X._zod.def.innerType;
});
function Cq(X, Q) {
  return new Q5({ type: "nonoptional", innerType: X, ...i.normalizeParams(Q) });
}
var kq = O("ZodCatch", (X, Q) => {
  EQ.init(X, Q), z0.init(X, Q), X.unwrap = () => X._zod.def.innerType, X.removeCatch = X.unwrap;
});
function vq(X, Q) {
  return new kq({ type: "catch", innerType: X, catchValue: typeof Q === "function" ? Q : () => Q });
}
var Tq = O("ZodPipe", (X, Q) => {
  bQ.init(X, Q), z0.init(X, Q), X.in = Q.in, X.out = Q.out;
});
function I$(X, Q) {
  return new Tq({ type: "pipe", in: X, out: Q });
}
var _q = O("ZodReadonly", (X, Q) => {
  PQ.init(X, Q), z0.init(X, Q);
});
function xq(X) {
  return new _q({ type: "readonly", innerType: X });
}
var $5 = O("ZodCustom", (X, Q) => {
  SQ.init(X, Q), z0.init(X, Q);
});
function yq(X, Q) {
  let $ = new A0({ check: "custom", ...i.normalizeParams(Q) });
  return $._zod.check = X, $;
}
function Y5(X, Q) {
  return q$($5, X ?? (() => true), Q);
}
function gq(X, Q = {}) {
  return F$($5, X, Q);
}
function fq(X, Q) {
  let $ = yq((Y) => {
    return Y.addIssue = (W) => {
      if (typeof W === "string") Y.issues.push(i.issue(W, Y.value, $._zod.def));
      else {
        let J = W;
        if (J.fatal) J.continue = false;
        J.code ?? (J.code = "custom"), J.input ?? (J.input = Y.value), J.inst ?? (J.inst = $), J.continue ?? (J.continue = !$._zod.def.abort), Y.issues.push(i.issue(J));
      }
    }, X(Y.value, Y);
  }, Q);
  return $;
}
function P$(X, Q) {
  return I$(eJ(X), Q);
}
u0(ZQ());
var z1 = "io.modelcontextprotocol/related-task";
var o4 = "2.0";
var B1 = Y5((X) => X !== null && (typeof X === "object" || typeof X === "function"));
var J5 = J0([D(), Q0().int()]);
var G5 = D();
var hq = c0({ ttl: J0([Q0(), E$()]).optional(), pollInterval: Q0().optional() });
var Z$ = c0({ taskId: D() });
var uq = c0({ progressToken: J5.optional(), [z1]: Z$.optional() });
var _0 = c0({ task: hq.optional(), _meta: uq.optional() });
var R0 = E({ method: D(), params: _0.optional() });
var G6 = c0({ _meta: E({ [z1]: v(Z$) }).passthrough().optional() });
var p0 = E({ method: D(), params: G6.optional() });
var P0 = c0({ _meta: c0({ [z1]: Z$.optional() }).optional() });
var t4 = J0([D(), Q0().int()]);
var H5 = E({ jsonrpc: T(o4), id: t4, ...R0.shape }).strict();
var B5 = E({ jsonrpc: T(o4), ...p0.shape }).strict();
var K5 = E({ jsonrpc: T(o4), id: t4, result: P0 }).strict();
var x;
(function(X) {
  X[X.ConnectionClosed = -32e3] = "ConnectionClosed", X[X.RequestTimeout = -32001] = "RequestTimeout", X[X.ParseError = -32700] = "ParseError", X[X.InvalidRequest = -32600] = "InvalidRequest", X[X.MethodNotFound = -32601] = "MethodNotFound", X[X.InvalidParams = -32602] = "InvalidParams", X[X.InternalError = -32603] = "InternalError", X[X.UrlElicitationRequired = -32042] = "UrlElicitationRequired";
})(x || (x = {}));
var U5 = E({ jsonrpc: T(o4), id: t4, error: E({ code: Q0().int(), message: D(), data: v(N0()) }) }).strict();
var IZ = J0([H5, B5, K5, U5]);
var a4 = P0.strict();
var lq = G6.extend({ requestId: t4, reason: D().optional() });
var s4 = p0.extend({ method: T("notifications/cancelled"), params: lq });
var mq = E({ src: D(), mimeType: D().optional(), sizes: r(D()).optional() });
var CX = E({ icons: r(mq).optional() });
var x6 = E({ name: D(), title: D().optional() });
var L5 = x6.extend({ ...x6.shape, ...CX.shape, version: D(), websiteUrl: D().optional() });
var cq = n4(E({ applyDefaults: M0().optional() }), O0(D(), N0()));
var pq = P$((X) => {
  if (X && typeof X === "object" && !Array.isArray(X)) {
    if (Object.keys(X).length === 0) return { form: {} };
  }
  return X;
}, n4(E({ form: cq.optional(), url: B1.optional() }), O0(D(), N0()).optional()));
var dq = E({ list: v(E({}).passthrough()), cancel: v(E({}).passthrough()), requests: v(E({ sampling: v(E({ createMessage: v(E({}).passthrough()) }).passthrough()), elicitation: v(E({ create: v(E({}).passthrough()) }).passthrough()) }).passthrough()) }).passthrough();
var iq = E({ list: v(E({}).passthrough()), cancel: v(E({}).passthrough()), requests: v(E({ tools: v(E({ call: v(E({}).passthrough()) }).passthrough()) }).passthrough()) }).passthrough();
var nq = E({ experimental: O0(D(), B1).optional(), sampling: E({ context: B1.optional(), tools: B1.optional() }).optional(), elicitation: pq.optional(), roots: E({ listChanged: M0().optional() }).optional(), tasks: v(dq) });
var rq = _0.extend({ protocolVersion: D(), capabilities: nq, clientInfo: L5 });
var k$ = R0.extend({ method: T("initialize"), params: rq });
var oq = E({ experimental: O0(D(), B1).optional(), logging: B1.optional(), completions: B1.optional(), prompts: v(E({ listChanged: v(M0()) })), resources: E({ subscribe: M0().optional(), listChanged: M0().optional() }).optional(), tools: E({ listChanged: M0().optional() }).optional(), tasks: v(iq) }).passthrough();
var tq = P0.extend({ protocolVersion: D(), capabilities: oq, serverInfo: L5, instructions: D().optional() });
var v$ = p0.extend({ method: T("notifications/initialized") });
var e4 = R0.extend({ method: T("ping") });
var aq = E({ progress: Q0(), total: v(Q0()), message: v(D()) });
var sq = E({ ...G6.shape, ...aq.shape, progressToken: J5 });
var X8 = p0.extend({ method: T("notifications/progress"), params: sq });
var eq = _0.extend({ cursor: G5.optional() });
var kX = R0.extend({ params: eq.optional() });
var vX = P0.extend({ nextCursor: v(G5) });
var TX = E({ taskId: D(), status: j0(["working", "input_required", "completed", "failed", "cancelled"]), ttl: J0([Q0(), E$()]), createdAt: D(), lastUpdatedAt: D(), pollInterval: v(Q0()), statusMessage: v(D()) });
var y6 = P0.extend({ task: TX });
var XF = G6.merge(TX);
var _X = p0.extend({ method: T("notifications/tasks/status"), params: XF });
var Q8 = R0.extend({ method: T("tasks/get"), params: _0.extend({ taskId: D() }) });
var $8 = P0.merge(TX);
var Y8 = R0.extend({ method: T("tasks/result"), params: _0.extend({ taskId: D() }) });
var W8 = kX.extend({ method: T("tasks/list") });
var J8 = vX.extend({ tasks: r(TX) });
var q5 = R0.extend({ method: T("tasks/cancel"), params: _0.extend({ taskId: D() }) });
var F5 = P0.merge(TX);
var N5 = E({ uri: D(), mimeType: v(D()), _meta: O0(D(), N0()).optional() });
var O5 = N5.extend({ text: D() });
var T$ = D().refine((X) => {
  try {
    return atob(X), true;
  } catch (Q) {
    return false;
  }
}, { message: "Invalid Base64 string" });
var D5 = N5.extend({ blob: T$ });
var g6 = E({ audience: r(j0(["user", "assistant"])).optional(), priority: Q0().min(0).max(1).optional(), lastModified: PX.datetime({ offset: true }).optional() });
var w5 = E({ ...x6.shape, ...CX.shape, uri: D(), description: v(D()), mimeType: v(D()), annotations: g6.optional(), _meta: v(c0({})) });
var QF = E({ ...x6.shape, ...CX.shape, uriTemplate: D(), description: v(D()), mimeType: v(D()), annotations: g6.optional(), _meta: v(c0({})) });
var G8 = kX.extend({ method: T("resources/list") });
var $F = vX.extend({ resources: r(w5) });
var H8 = kX.extend({ method: T("resources/templates/list") });
var YF = vX.extend({ resourceTemplates: r(QF) });
var _$ = _0.extend({ uri: D() });
var WF = _$;
var B8 = R0.extend({ method: T("resources/read"), params: WF });
var JF = P0.extend({ contents: r(J0([O5, D5])) });
var GF = p0.extend({ method: T("notifications/resources/list_changed") });
var HF = _$;
var BF = R0.extend({ method: T("resources/subscribe"), params: HF });
var zF = _$;
var KF = R0.extend({ method: T("resources/unsubscribe"), params: zF });
var UF = G6.extend({ uri: D() });
var VF = p0.extend({ method: T("notifications/resources/updated"), params: UF });
var LF = E({ name: D(), description: v(D()), required: v(M0()) });
var qF = E({ ...x6.shape, ...CX.shape, description: v(D()), arguments: v(r(LF)), _meta: v(c0({})) });
var z8 = kX.extend({ method: T("prompts/list") });
var FF = vX.extend({ prompts: r(qF) });
var NF = _0.extend({ name: D(), arguments: O0(D(), D()).optional() });
var K8 = R0.extend({ method: T("prompts/get"), params: NF });
var x$ = E({ type: T("text"), text: D(), annotations: g6.optional(), _meta: O0(D(), N0()).optional() });
var y$ = E({ type: T("image"), data: T$, mimeType: D(), annotations: g6.optional(), _meta: O0(D(), N0()).optional() });
var g$ = E({ type: T("audio"), data: T$, mimeType: D(), annotations: g6.optional(), _meta: O0(D(), N0()).optional() });
var OF = E({ type: T("tool_use"), name: D(), id: D(), input: E({}).passthrough(), _meta: v(E({}).passthrough()) }).passthrough();
var DF = E({ type: T("resource"), resource: J0([O5, D5]), annotations: g6.optional(), _meta: O0(D(), N0()).optional() });
var wF = w5.extend({ type: T("resource_link") });
var f$ = J0([x$, y$, g$, wF, DF]);
var AF = E({ role: j0(["user", "assistant"]), content: f$ });
var MF = P0.extend({ description: v(D()), messages: r(AF) });
var jF = p0.extend({ method: T("notifications/prompts/list_changed") });
var RF = E({ title: D().optional(), readOnlyHint: M0().optional(), destructiveHint: M0().optional(), idempotentHint: M0().optional(), openWorldHint: M0().optional() });
var IF = E({ taskSupport: j0(["required", "optional", "forbidden"]).optional() });
var A5 = E({ ...x6.shape, ...CX.shape, description: D().optional(), inputSchema: E({ type: T("object"), properties: O0(D(), B1).optional(), required: r(D()).optional() }).catchall(N0()), outputSchema: E({ type: T("object"), properties: O0(D(), B1).optional(), required: r(D()).optional() }).catchall(N0()).optional(), annotations: v(RF), execution: v(IF), _meta: O0(D(), N0()).optional() });
var U8 = kX.extend({ method: T("tools/list") });
var EF = vX.extend({ tools: r(A5) });
var V8 = P0.extend({ content: r(f$).default([]), structuredContent: O0(D(), N0()).optional(), isError: v(M0()) });
var EZ = V8.or(P0.extend({ toolResult: N0() }));
var bF = _0.extend({ name: D(), arguments: v(O0(D(), N0())) });
var f6 = R0.extend({ method: T("tools/call"), params: bF });
var PF = p0.extend({ method: T("notifications/tools/list_changed") });
var xX = j0(["debug", "info", "notice", "warning", "error", "critical", "alert", "emergency"]);
var SF = _0.extend({ level: xX });
var h$ = R0.extend({ method: T("logging/setLevel"), params: SF });
var ZF = G6.extend({ level: xX, logger: D().optional(), data: N0() });
var CF = p0.extend({ method: T("notifications/message"), params: ZF });
var kF = E({ name: D().optional() });
var vF = E({ hints: v(r(kF)), costPriority: v(Q0().min(0).max(1)), speedPriority: v(Q0().min(0).max(1)), intelligencePriority: v(Q0().min(0).max(1)) });
var TF = E({ mode: v(j0(["auto", "required", "none"])) });
var _F = E({ type: T("tool_result"), toolUseId: D().describe("The unique identifier for the corresponding tool call."), content: r(f$).default([]), structuredContent: E({}).passthrough().optional(), isError: v(M0()), _meta: v(E({}).passthrough()) }).passthrough();
var xF = b$("type", [x$, y$, g$]);
var r4 = b$("type", [x$, y$, g$, OF, _F]);
var yF = E({ role: j0(["user", "assistant"]), content: J0([r4, r(r4)]), _meta: v(E({}).passthrough()) }).passthrough();
var gF = _0.extend({ messages: r(yF), modelPreferences: vF.optional(), systemPrompt: D().optional(), includeContext: j0(["none", "thisServer", "allServers"]).optional(), temperature: Q0().optional(), maxTokens: Q0().int(), stopSequences: r(D()).optional(), metadata: B1.optional(), tools: v(r(A5)), toolChoice: v(TF) });
var fF = R0.extend({ method: T("sampling/createMessage"), params: gF });
var u$ = P0.extend({ model: D(), stopReason: v(j0(["endTurn", "stopSequence", "maxTokens"]).or(D())), role: j0(["user", "assistant"]), content: xF });
var l$ = P0.extend({ model: D(), stopReason: v(j0(["endTurn", "stopSequence", "maxTokens", "toolUse"]).or(D())), role: j0(["user", "assistant"]), content: J0([r4, r(r4)]) });
var hF = E({ type: T("boolean"), title: D().optional(), description: D().optional(), default: M0().optional() });
var uF = E({ type: T("string"), title: D().optional(), description: D().optional(), minLength: Q0().optional(), maxLength: Q0().optional(), format: j0(["email", "uri", "date", "date-time"]).optional(), default: D().optional() });
var lF = E({ type: j0(["number", "integer"]), title: D().optional(), description: D().optional(), minimum: Q0().optional(), maximum: Q0().optional(), default: Q0().optional() });
var mF = E({ type: T("string"), title: D().optional(), description: D().optional(), enum: r(D()), default: D().optional() });
var cF = E({ type: T("string"), title: D().optional(), description: D().optional(), oneOf: r(E({ const: D(), title: D() })), default: D().optional() });
var pF = E({ type: T("string"), title: D().optional(), description: D().optional(), enum: r(D()), enumNames: r(D()).optional(), default: D().optional() });
var dF = J0([mF, cF]);
var iF = E({ type: T("array"), title: D().optional(), description: D().optional(), minItems: Q0().optional(), maxItems: Q0().optional(), items: E({ type: T("string"), enum: r(D()) }), default: r(D()).optional() });
var nF = E({ type: T("array"), title: D().optional(), description: D().optional(), minItems: Q0().optional(), maxItems: Q0().optional(), items: E({ anyOf: r(E({ const: D(), title: D() })) }), default: r(D()).optional() });
var rF = J0([iF, nF]);
var oF = J0([pF, dF, rF]);
var tF = J0([oF, hF, uF, lF]);
var aF = _0.extend({ mode: T("form").optional(), message: D(), requestedSchema: E({ type: T("object"), properties: O0(D(), tF), required: r(D()).optional() }) });
var sF = _0.extend({ mode: T("url"), message: D(), elicitationId: D(), url: D().url() });
var eF = J0([aF, sF]);
var XN = R0.extend({ method: T("elicitation/create"), params: eF });
var QN = G6.extend({ elicitationId: D() });
var $N = p0.extend({ method: T("notifications/elicitation/complete"), params: QN });
var L8 = P0.extend({ action: j0(["accept", "decline", "cancel"]), content: P$((X) => X === null ? void 0 : X, O0(D(), J0([D(), Q0(), M0(), r(D())])).optional()) });
var YN = E({ type: T("ref/resource"), uri: D() });
var WN = E({ type: T("ref/prompt"), name: D() });
var JN = _0.extend({ ref: J0([WN, YN]), argument: E({ name: D(), value: D() }), context: E({ arguments: O0(D(), D()).optional() }).optional() });
var q8 = R0.extend({ method: T("completion/complete"), params: JN });
var GN = P0.extend({ completion: c0({ values: r(D()).max(100), total: v(Q0().int()), hasMore: v(M0()) }) });
var HN = E({ uri: D().startsWith("file://"), name: D().optional(), _meta: O0(D(), N0()).optional() });
var BN = R0.extend({ method: T("roots/list") });
var m$ = P0.extend({ roots: r(HN) });
var zN = p0.extend({ method: T("notifications/roots/list_changed") });
var bZ = J0([e4, k$, q8, h$, K8, z8, G8, H8, B8, BF, KF, f6, U8, Q8, Y8, W8]);
var PZ = J0([s4, X8, v$, zN, _X]);
var SZ = J0([a4, u$, l$, L8, m$, $8, J8, y6]);
var ZZ = J0([e4, fF, XN, BN, Q8, Y8, W8]);
var CZ = J0([s4, X8, CF, VF, GF, PF, jF, _X, $N]);
var kZ = J0([a4, tq, GN, MF, FF, $F, YF, JF, V8, EF, $8, J8, y6]);
var VN = new Set("ABCDEFGHIJKLMNOPQRSTUVXYZabcdefghijklmnopqrstuvxyz0123456789");
var uz = U7(pY(), 1);
var lz = U7(hz(), 1);
var pz;
(function(X) {
  X.Completable = "McpCompletable";
})(pz || (pz = {}));
function Qx({ prompt: X, options: Q }) {
  let { systemPrompt: $, settingSources: Y, sandbox: W, ...J } = Q ?? {}, G, H;
  if ($ === void 0) G = "";
  else if (typeof $ === "string") G = $;
  else if ($.type === "preset") H = $.append;
  let B = J.pathToClaudeCodeExecutable;
  if (!B) {
    let F6 = yI(import.meta.url), N6 = az(F6, "..");
    B = az(N6, "cli.js");
  }
  process.env.CLAUDE_AGENT_SDK_VERSION = "0.2.38";
  let { abortController: z = O6(), additionalDirectories: K = [], agent: V, agents: L, allowedTools: U = [], betas: F, canUseTool: q, continue: N, cwd: w, debug: M, debugFile: R, disallowedTools: S = [], tools: C, env: K0, executable: U0 = R6() ? "bun" : "node", executableArgs: s = [], extraArgs: D0 = {}, fallbackModel: q0, enableFileCheckpointing: L1, forkSession: P1, hooks: o1, includePartialMessages: m, persistSession: $9, thinking: t1, effort: t6, maxThinkingTokens: a6, maxTurns: H4, maxBudgetUsd: B4, mcpServers: E0, model: S1, outputFormat: L6, permissionMode: sz = "default", allowDangerouslySkipPermissions: ez = false, permissionPromptToolName: XK, plugins: QK, resume: $K, resumeSessionAt: YK, sessionId: WK, stderr: JK, strictMcpConfig: GK } = J, H7 = L6?.type === "json_schema" ? L6.schema : void 0, q6 = K0;
  if (!q6) q6 = { ...process.env };
  if (!q6.CLAUDE_CODE_ENTRYPOINT) q6.CLAUDE_CODE_ENTRYPOINT = "sdk-ts";
  if (L1) q6.CLAUDE_CODE_ENABLE_SDK_FILE_CHECKPOINTING = "true";
  if (!B) throw Error("pathToClaudeCodeExecutable is required");
  let Y9 = {}, B7 = /* @__PURE__ */ new Map();
  if (E0) for (let [F6, N6] of Object.entries(E0)) if (N6.type === "sdk" && "instance" in N6) B7.set(F6, N6.instance), Y9[F6] = { type: "sdk", name: F6 };
  else Y9[F6] = N6;
  let HK = typeof X === "string", z4 = a6;
  if (t1) switch (t1.type) {
    case "adaptive":
      z4 = void 0;
      break;
    case "enabled":
      z4 = t1.budgetTokens;
      break;
    case "disabled":
      z4 = 0;
      break;
  }
  let z7 = new e6({ abortController: z, additionalDirectories: K, agent: V, betas: F, cwd: w, debug: M, debugFile: R, executable: U0, executableArgs: s, extraArgs: D0, pathToClaudeCodeExecutable: B, env: q6, forkSession: P1, stderr: JK, maxThinkingTokens: z4, effort: t6, maxTurns: H4, maxBudgetUsd: B4, model: S1, fallbackModel: q0, jsonSchema: H7, permissionMode: sz, allowDangerouslySkipPermissions: ez, permissionPromptToolName: XK, continueConversation: N, resume: $K, resumeSessionAt: YK, sessionId: WK, settingSources: Y ?? [], allowedTools: U, disallowedTools: S, tools: C, mcpServers: Y9, strictMcpConfig: GK, canUseTool: !!q, hooks: !!o1, includePartialMessages: m, persistSession: $9, plugins: QK, sandbox: W, spawnClaudeCodeProcess: J.spawnClaudeCodeProcess }), K7 = new QX(z7, HK, q, o1, z, B7, H7, { systemPrompt: G, appendSystemPrompt: H, agents: L });
  if (typeof X === "string") z7.write(Z0({ type: "user", session_id: "", message: { role: "user", content: [{ type: "text", text: X }] }, parent_tool_use_id: null }) + `
`);
  else K7.streamInput(X);
  return K7;
}

// hooks/claude-md-manager.mjs
import { execSync } from "child_process";
import { existsSync as existsSync2, mkdirSync as mkdirSync2, readdirSync as readdirSync2, readFileSync as readFileSync2, statSync as statSync2, writeFileSync } from "fs";
import { basename, dirname, join, relative } from "path";
var HOOK_NAME = "claude-md-manager";
var STATE_FILE_NAME = "claude-md-manager-cache.json";
function appendLog(message) {
  const homeDir = process.env.HOME;
  if (!homeDir) return;
  const logPath = join(homeDir, ".claude", "logs", "hooks.log");
  const timestamp = (/* @__PURE__ */ new Date()).toISOString();
  const entry = `[${timestamp}] [${HOOK_NAME}] ${message}
`;
  try {
    writeFileSync(logPath, entry, { flag: "a" });
  } catch (error) {
  }
}
function getStateFilePath() {
  const homeDir = process.env.HOME;
  if (!homeDir) return null;
  return join(homeDir, ".claude", "state", STATE_FILE_NAME);
}
function loadProcessingCache() {
  const statePath = getStateFilePath();
  if (!statePath || !existsSync2(statePath)) return {};
  try {
    return JSON.parse(readFileSync2(statePath, "utf-8"));
  } catch (error) {
    appendLog(`[WARN] Failed to load cache: ${error.message}`);
    return {};
  }
}
function saveProcessingCache(cache) {
  const statePath = getStateFilePath();
  if (!statePath) return;
  try {
    mkdirSync2(dirname(statePath), { recursive: true });
    writeFileSync(statePath, JSON.stringify(cache, null, 2));
  } catch (error) {
    appendLog(`[WARN] Failed to persist cache: ${error.message}`);
  }
}
function getFileSignature(filePath) {
  try {
    const stats = statSync2(filePath);
    return { deleted: false, mtimeMs: stats.mtimeMs, size: stats.size };
  } catch (error) {
    return { deleted: true };
  }
}
function signaturesEqual(current, cached) {
  if (!current || !cached) return false;
  if (current.deleted !== cached.deleted) return false;
  if (current.deleted) return true;
  return current.mtimeMs === cached.mtimeMs && current.size === cached.size;
}
function markFilesAsHandled(filesInDir, filesHandled) {
  for (const { file, signature } of filesInDir) {
    filesHandled.set(file, signature);
  }
}
function pruneCache(cache, activeFiles) {
  if (!cache) return {};
  const pruned = {};
  for (const [file, signature] of Object.entries(cache)) {
    if (activeFiles.has(file)) {
      pruned[file] = signature;
    }
  }
  return pruned;
}
function getDirectoryInfo(dirPath, cwd) {
  if (!existsSync2(dirPath)) {
    const relativeDirPath2 = relative(cwd, dirPath);
    const isRoot2 = relativeDirPath2 === "";
    return {
      fileCount: 0,
      fileTypes: [],
      subdirs: [],
      relativeDirPath: relativeDirPath2,
      isRoot: isRoot2,
      targetLines: isRoot2 ? "~150" : "<25"
    };
  }
  const dirContents = readdirSync2(dirPath);
  const files = dirContents.filter((f) => {
    const fullPath = join(dirPath, f);
    try {
      return statSync2(fullPath).isFile();
    } catch (error) {
      return false;
    }
  });
  const fileTypes = files.map((f) => f.split(".").pop()).filter((ext) => ext && ext.length < 10);
  const subdirs = dirContents.filter((f) => {
    const fullPath = join(dirPath, f);
    try {
      return statSync2(fullPath).isDirectory() && !f.startsWith(".");
    } catch (error) {
      return false;
    }
  });
  const relativeDirPath = relative(cwd, dirPath);
  const isRoot = relativeDirPath === "";
  let targetLines;
  if (isRoot) {
    targetLines = "~150";
  } else if (fileTypes.length > 20 || subdirs.length > 8) {
    targetLines = "~100";
  } else if (fileTypes.length < 5 && subdirs.length < 3) {
    targetLines = "<25";
  } else {
    targetLines = "~50";
  }
  return { fileCount: files.length, fileTypes, subdirs, relativeDirPath, isRoot, targetLines };
}
function loadIgnoreFile(filePath) {
  if (!existsSync2(filePath)) return [];
  try {
    const content = readFileSync2(filePath, "utf-8");
    return content.split("\n").map((line) => line.trim()).filter((line) => line && !line.startsWith("#"));
  } catch (error) {
    return [];
  }
}
function loadSettings(cwd) {
  const homeDir = process.env.HOME;
  const excludedDirectories = [];
  if (homeDir) {
    const candidatePaths = [
      join(homeDir, ".claude", ".claude-md-manager-ignore"),
      join(homeDir, ".claude-md-manager-ignore")
    ];
    for (const path of candidatePaths) {
      excludedDirectories.push(...loadIgnoreFile(path));
    }
  }
  const localIgnorePath = join(cwd, ".claude-md-manager-ignore");
  excludedDirectories.push(...loadIgnoreFile(localIgnorePath));
  return { excludedDirectories };
}
function isDirectoryExcluded(relativePath, excludedPatterns) {
  for (const pattern of excludedPatterns) {
    const normalizedPattern = pattern.replace(/\/$/, "");
    const pathParts = relativePath.split("/");
    if (relativePath === normalizedPattern) return true;
    if (relativePath.startsWith(normalizedPattern + "/")) return true;
    const wildcardDirMatch = normalizedPattern.match(/^(.*)\/(\*)$/);
    if (wildcardDirMatch) {
      const baseDir = wildcardDirMatch[1];
      if (relativePath === baseDir || relativePath.startsWith(baseDir + "/")) {
        return true;
      }
    }
    for (const part of pathParts) {
      if (part === normalizedPattern) return true;
    }
    if (normalizedPattern.includes("*")) {
      const regex = new RegExp("^" + normalizedPattern.replace(/\*/g, ".*") + "$");
      if (regex.test(relativePath)) return true;
    }
  }
  return false;
}
function getClaudeMdHierarchy(fileDir, cwd) {
  const claudeMdHierarchy = [];
  let currentDir = fileDir;
  while (currentDir.startsWith(cwd)) {
    const potentialClaudeMd = join(currentDir, "CLAUDE.md");
    if (existsSync2(potentialClaudeMd) && currentDir !== fileDir) {
      const content = readFileSync2(potentialClaudeMd, "utf-8");
      const lineCount = content.split("\n").length;
      claudeMdHierarchy.unshift({
        path: relative(cwd, potentialClaudeMd),
        content,
        lineCount
      });
    }
    const parentDir = dirname(currentDir);
    if (parentDir === currentDir) break;
    currentDir = parentDir;
  }
  return claudeMdHierarchy;
}
function discoverGitRepos(cwd) {
  try {
    const gitRoot = execSync("git rev-parse --show-toplevel", { cwd, encoding: "utf8" }).trim();
    return [gitRoot];
  } catch (_error) {
  }
  const repos = [];
  let entries;
  try {
    entries = readdirSync2(cwd);
  } catch (_error) {
    return repos;
  }
  for (const entry of entries) {
    if (entry.startsWith(".")) continue;
    const childPath = join(cwd, entry);
    try {
      if (!statSync2(childPath).isDirectory()) continue;
    } catch (_error) {
      continue;
    }
    if (existsSync2(join(childPath, ".git"))) {
      repos.push(childPath);
    }
  }
  return repos;
}
async function processRepo(repoCwd, sessionId, processingCache) {
  const homeDir = process.env.HOME;
  const changedFileSet = /* @__PURE__ */ new Set();
  const filesHandled = /* @__PURE__ */ new Map();
  let changedFiles = [];
  try {
    const gitOutput = execSync("git diff --name-only HEAD", { cwd: repoCwd, encoding: "utf8" });
    changedFiles = gitOutput.trim().split("\n").filter(Boolean);
    if (changedFiles.length === 0) {
      appendLog(`[START] session=${sessionId}, cwd=${repoCwd} | [SKIP] No file changes detected`);
      return { changedFileSet, filesHandled, directoriesProcessed: 0 };
    }
  } catch (error) {
    appendLog(`[START] session=${sessionId}, cwd=${repoCwd} | [SKIP] Git check failed or not a repo`);
    return { changedFileSet, filesHandled, directoriesProcessed: 0 };
  }
  const directoryFiles = /* @__PURE__ */ new Map();
  const relativeDirLookup = /* @__PURE__ */ new Map();
  let skippedGitIgnored = 0;
  let unchangedSinceLastRun = 0;
  for (const file of changedFiles) {
    const filePath = join(repoCwd, file);
    const fileDir = dirname(filePath);
    const relativePath = relative(repoCwd, fileDir) || ".";
    if (relativePath.includes(".claude")) continue;
    if (basename(filePath) === "CLAUDE.md") continue;
    if (relativePath.startsWith("..")) continue;
    try {
      execSync(`git check-ignore -q "${file}"`, { cwd: repoCwd, stdio: "pipe" });
      skippedGitIgnored++;
      continue;
    } catch (_error) {
    }
    const cacheKey = join(repoCwd, file);
    changedFileSet.add(cacheKey);
    const signature = getFileSignature(filePath);
    const cachedSignature = processingCache[cacheKey];
    if (cachedSignature && signaturesEqual(signature, cachedSignature)) {
      unchangedSinceLastRun++;
      continue;
    }
    if (!directoryFiles.has(fileDir)) {
      directoryFiles.set(fileDir, []);
      relativeDirLookup.set(fileDir, relativePath);
    }
    directoryFiles.get(fileDir).push({ file: cacheKey, signature });
  }
  if (directoryFiles.size === 0) {
    const detailParts = [];
    if (unchangedSinceLastRun > 0) detailParts.push(`unchanged=${unchangedSinceLastRun}`);
    if (skippedGitIgnored > 0) detailParts.push(`git-ignored=${skippedGitIgnored}`);
    const detailSuffix = detailParts.length > 0 ? ` (${detailParts.join(", ")})` : "";
    appendLog(`[START] session=${sessionId}, cwd=${repoCwd} | [SKIP] No new file changes since last run${detailSuffix}`);
    return { changedFileSet, filesHandled, directoriesProcessed: 0 };
  }
  const { excludedDirectories } = loadSettings(repoCwd);
  const directoriesToProcess = [];
  for (const [fileDir, filesInDir] of directoryFiles.entries()) {
    const relativePath = relativeDirLookup.get(fileDir) || ".";
    if (isDirectoryExcluded(relativePath, excludedDirectories)) {
      appendLog(`[SKIP] ${relativePath} (excluded by config)`);
      markFilesAsHandled(filesInDir, filesHandled);
      continue;
    }
    const claudeMdPath = join(fileDir, "CLAUDE.md");
    const globalClaudePath = homeDir ? join(homeDir, ".claude", "CLAUDE.md") : null;
    if (globalClaudePath && claudeMdPath === globalClaudePath) {
      appendLog(`[SKIP] ${relativePath} (global CLAUDE.md - not managed by hook)`);
      markFilesAsHandled(filesInDir, filesHandled);
      continue;
    }
    const hasClaudeMd = existsSync2(claudeMdPath);
    const existingClaudeMd = hasClaudeMd ? readFileSync2(claudeMdPath, "utf-8") : "";
    const { fileCount, fileTypes, subdirs, isRoot, targetLines } = getDirectoryInfo(fileDir, repoCwd);
    if (!hasClaudeMd && !isRoot && fileCount < 4) {
      appendLog(`[SKIP] ${relativePath} (only ${fileCount} files, need \u22654)`);
      markFilesAsHandled(filesInDir, filesHandled);
      continue;
    }
    const claudeMdHierarchy = getClaudeMdHierarchy(fileDir, repoCwd);
    const changedFilesInDir = filesInDir.map(({ file }) => basename(file));
    const customGuidancePath = join(fileDir, ".claude-md-manager.md");
    const customGuidance = existsSync2(customGuidancePath) ? readFileSync2(customGuidancePath, "utf-8") : null;
    directoriesToProcess.push({
      relativePath,
      claudeMdPath,
      hasClaudeMd,
      existingClaudeMd,
      fileTypes,
      subdirs,
      isRoot,
      targetLines,
      claudeMdHierarchy,
      changedFilesInDir,
      filesInDir,
      customGuidance
    });
  }
  const startParts = [
    `session=${sessionId}`,
    `directories=${directoriesToProcess.length}`
  ];
  if (skippedGitIgnored > 0) startParts.push(`git-ignored=${skippedGitIgnored}`);
  if (unchangedSinceLastRun > 0) startParts.push(`unchanged=${unchangedSinceLastRun}`);
  appendLog(`[START] ${startParts.join(", ")}`);
  if (excludedDirectories.length > 0) {
    appendLog(`[CONFIG] Excluded directories: ${excludedDirectories.join(", ")}`);
  }
  if (directoriesToProcess.length === 0) {
    appendLog("[SKIP] No directories qualified after filtering");
    return { changedFileSet, filesHandled, directoriesProcessed: 0 };
  }
  for (const {
    relativePath,
    claudeMdPath,
    hasClaudeMd,
    existingClaudeMd,
    fileTypes,
    subdirs,
    isRoot,
    targetLines,
    claudeMdHierarchy,
    changedFilesInDir,
    filesInDir,
    customGuidance
  } of directoriesToProcess) {
    let hierarchyContext = "";
    if (claudeMdHierarchy.length > 0) {
      hierarchyContext = "\n\n## Parent CLAUDE.md Files (for context)\n\n";
      for (const { path, content, lineCount } of claudeMdHierarchy) {
        hierarchyContext += `### ${path} (${lineCount} lines)
\`\`\`
${content}
\`\`\`

`;
      }
    }
    let customGuidanceContext = "";
    if (customGuidance) {
      customGuidanceContext = "\n\n## Custom Guidance For This Directory\n\n" + customGuidance + "\n\n";
    }
    const systemPrompt = isRoot ? `Create or update the root CLAUDE.md. Guardrails and pointers, not a manual.

## Prioritize
1. Constraints and gotchas \u2014 what breaks if ignored
2. Key commands \u2014 build, test, lint (80% cases)
3. Architecture \u2014 how components relate, 2-3 sentences max
4. Conventions that differ from defaults

## Constraints
- Never "Never X" without the alternative
- Don't list obvious things (language, framework) unless there's a gotcha
- Reference other docs with *when/why* to read them
- Short declarative bullets > paragraphs

## Output
Write tool only, no explanatory text.` : `Create or update a subdirectory CLAUDE.md. Only document non-obvious, codebase-specific information.

## Good content
- Non-obvious behavior (race guards, fallback chains, state machines, execution paths)
- Cross-module relationships not apparent from file names
- Constraints that cause bugs if violated (timeouts, ordering, idempotency)

## Bad content \u2014 write NOTHING instead
- Generic framework guidance ("use @Cron decorator", "handle errors gracefully")
- Restating what's obvious from directory/file names
- Repeating parent CLAUDE.md content
- Generic best practices ("use dependency injection", "write tests")

## Constraints
- Never "Never X" without the alternative
- Every line must earn its place \u2014 cut anything a developer would say "obviously" to
- Reference other docs with *when/why* to read them

## Output
Write tool if worth documenting, otherwise output NOTHING.`;
    const userPrompt = hasClaudeMd ? `Directory: ${relativePath}
Changed files: ${changedFilesInDir.join(", ")}
Target length: ${targetLines} lines

Current CLAUDE.md (${existingClaudeMd.split("\n").length} lines):
\`\`\`
${existingClaudeMd}
\`\`\`
${hierarchyContext}${customGuidanceContext}
Contents: ${fileTypes.slice(0, 10).join(", ")}${subdirs.length > 0 ? ` | subdirs: ${subdirs.slice(0, 10).join(", ")}` : ""}

Update ${claudeMdPath} if the current content is generic padding or missing important patterns. Do nothing if already good.` : `Directory: ${relativePath}
Changed files: ${changedFilesInDir.join(", ")}
Target length: ${targetLines} lines

No CLAUDE.md exists.
${hierarchyContext}${customGuidanceContext}
Contents: ${fileTypes.slice(0, 10).join(", ")}${subdirs.length > 0 ? ` | subdirs: ${subdirs.slice(0, 10).join(", ")}` : ""}

Create ${claudeMdPath} if there's non-obvious behavior worth documenting. Do nothing otherwise.`;
    try {
      const result = Qx({
        prompt: userPrompt,
        cwd: repoCwd,
        options: {
          systemPrompt,
          model: "claude-sonnet-4-6",
          allowedTools: ["Read", "Glob", "Grep", "Write"],
          permissionMode: "bypassPermissions",
          hooks: {},
          pathToClaudeCodeExecutable: "/opt/homebrew/bin/claude"
        }
      });
      for await (const _message of result) {
      }
      appendLog(`[PROCESSED] ${relativePath}`);
      markFilesAsHandled(filesInDir, filesHandled);
    } catch (error) {
      appendLog(`[ERROR] ${relativePath}: ${error.message}`);
    }
  }
  return { changedFileSet, filesHandled, directoriesProcessed: directoriesToProcess.length };
}
async function backgroundWorker() {
  const chunks = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }
  const input = Buffer.concat(chunks).toString("utf-8");
  const { sessionId, cwd, parentSessionId } = JSON.parse(input);
  const trackingSessionId = parentSessionId || sessionId;
  const homeDir = process.env.HOME;
  const lockPath = homeDir ? join(homeDir, ".claude", "state", `claude-md-${trackingSessionId}.lock`) : null;
  if (lockPath && existsSync2(lockPath)) {
    appendLog(`[SKIP] session=${sessionId} | Already processed for parent session=${trackingSessionId}`);
    process.exit(0);
  }
  if (lockPath) {
    try {
      const lockDir = dirname(lockPath);
      execSync(`mkdir -p "${lockDir}"`, { stdio: "ignore" });
      writeFileSync(lockPath, JSON.stringify({ sessionId, parentSessionId, timestamp: (/* @__PURE__ */ new Date()).toISOString() }));
    } catch (error) {
      appendLog(`[WARN] session=${sessionId} | Could not create lock file: ${error.message}`);
    }
  }
  const repos = discoverGitRepos(cwd);
  if (repos.length === 0) {
    appendLog(`[START] session=${sessionId}, cwd=${cwd} | [SKIP] No git repos found`);
    process.exit(0);
  }
  if (repos.length > 1) {
    appendLog(`[DISCOVER] Found ${repos.length} git repos under ${cwd}: ${repos.map((r3) => relative(cwd, r3) || ".").join(", ")}`);
  }
  const processingCache = loadProcessingCache();
  const allChangedFiles = /* @__PURE__ */ new Set();
  const allFilesHandled = /* @__PURE__ */ new Map();
  let totalDirectoriesProcessed = 0;
  for (const repoCwd of repos) {
    const result = await processRepo(repoCwd, sessionId, processingCache);
    for (const f of result.changedFileSet) allChangedFiles.add(f);
    for (const [f, sig] of result.filesHandled) allFilesHandled.set(f, sig);
    totalDirectoriesProcessed += result.directoriesProcessed;
  }
  const finalCache = pruneCache(processingCache, allChangedFiles);
  for (const [file, signature] of allFilesHandled.entries()) {
    finalCache[file] = signature;
  }
  saveProcessingCache(finalCache);
  if (totalDirectoriesProcessed > 0) {
    const repoLabel = repos.length > 1 ? ` across ${repos.length} repos` : "";
    appendLog(`[DONE] session=${sessionId} | processed ${totalDirectoriesProcessed} directories${repoLabel}`);
  }
  process.exit(0);
}
async function main() {
  if (process.argv.includes("--background")) {
    await backgroundWorker();
    return;
  }
  const stdin = readFileSync2(0, "utf-8");
  const inputData = JSON.parse(stdin);
  const isSessionEnd = inputData.hook_event_name === "SessionEnd";
  const isSessionStartClear = inputData.hook_event_name === "SessionStart" && inputData.source === "clear";
  if (!isSessionEnd && !isSessionStartClear) {
    process.exit(0);
  }
  if (inputData.reason === "other") {
    appendLog(`SessionEnd reason: ${inputData.reason}, skipping`);
    process.exit(0);
  }
  const sessionId = inputData.session_id;
  const cwd = inputData.cwd || process.cwd();
  if (!sessionId) {
    process.exit(0);
  }
  let parentSessionId = null;
  try {
    const transcriptPath = inputData.transcript_path;
    if (transcriptPath && existsSync2(transcriptPath)) {
      const transcript = readFileSync2(transcriptPath, "utf-8");
      const lines = transcript.trim().split("\n").filter(Boolean);
      for (const line of lines) {
        try {
          const event = JSON.parse(line);
          if (event.type === "session_start") {
            parentSessionId = event.sessionId || sessionId;
            break;
          }
        } catch {
          continue;
        }
      }
    }
  } catch (error) {
  }
  const { spawn } = await import("child_process");
  const workerData = JSON.stringify({
    sessionId,
    parentSessionId,
    cwd
  });
  const child = spawn(process.execPath, [
    import.meta.url.replace("file://", ""),
    "--background"
  ], {
    detached: true,
    stdio: ["pipe", "ignore", "ignore"]
  });
  child.stdin.write(workerData);
  child.stdin.end();
  child.unref();
  process.exit(0);
}
main();
