/**
 * Created by stefan on 15.01.17.
 */

var EasyStar = function(t) {
    function n(o) {
        if (e[o]) return e[o].exports;
        var i = e[o] = {
            exports: {},
            id: o,
            loaded: !1
        };
        return t[o].call(i.exports, i, i.exports, n), i.loaded = !0, i.exports
    }
    var e = {};
    return n.m = t, n.c = e, n.p = "", n(0)
}([function(t, n, e) {
    var o = {},
        i = e(1),
        r = e(2),
        s = e(3);
    const a = 0,
        u = 1;
    t.exports = o, o.js = function() {
        var t, n, e, o = 1,
            c = 1.4,
            l = !1,
            h = {},
            p = {},
            f = {},
            d = !0,
            y = [],
            v = Number.MAX_VALUE,
            g = !1;
        this.setAcceptableTiles = function(t) {
            t instanceof Array ? e = t : !isNaN(parseFloat(t)) && isFinite(t) && (e = [t])
        }, this.enableSync = function() {
            l = !0
        }, this.disableSync = function() {
            l = !1
        }, this.enableDiagonals = function() {
            g = !0
        }, this.disableDiagonals = function() {
            g = !1
        }, this.setGrid = function(n) {
            t = n;
            for (var e = 0; e < t.length; e++)
                for (var o = 0; o < t[0].length; o++) p[t[e][o]] || (p[t[e][o]] = 1)
        }, this.setTileCost = function(t, n) {
            p[t] = n
        }, this.setAdditionalPointCost = function(t, n, e) {
            f[t + "_" + n] = e
        }, this.removeAdditionalPointCost = function(t, n) {
            delete f[t + "_" + n]
        }, this.removeAllAdditionalPointCosts = function() {
            f = {}
        }, this.setIterationsPerCalculation = function(t) {
            v = t
        }, this.avoidAdditionalPoint = function(t, n) {
            h[t + "_" + n] = 1
        }, this.stopAvoidingAdditionalPoint = function(t, n) {
            delete h[t + "_" + n]
        }, this.enableCornerCutting = function() {
            d = !0
        }, this.disableCornerCutting = function() {
            d = !1
        }, this.stopAvoidingAllAdditionalPoints = function() {
            h = {}
        }, this.findPath = function(n, r, a, u, c) {
            var h = function(t) {
                l ? c(t) : setTimeout(function() {
                    c(t)
                })
            };
            if (void 0 === e) throw new Error("You can't set a path without first calling setAcceptableTiles() on EasyStar.");
            if (void 0 === t) throw new Error("You can't set a path without first calling setGrid() on EasyStar.");
            if (0 > n || 0 > r || 0 > a || 0 > u || n > t[0].length - 1 || r > t.length - 1 || a > t[0].length - 1 || u > t.length - 1) throw new Error("Your start or end point is outside the scope of your grid.");
            if (n === a && r === u) return void h([]);
            for (var p = t[u][a], f = !1, d = 0; d < e.length; d++)
                if (p === e[d]) {
                    f = !0;
                    break
                }
            if (f === !1) return void h(null);
            var v = new i;
            v.openList = new s(function(t, n) {
                return t.bestGuessDistance() - n.bestGuessDistance()
            }), v.isDoneCalculating = !1, v.nodeHash = {}, v.startX = n, v.startY = r, v.endX = a, v.endY = u, v.callback = h, v.openList.push(A(v, v.startX, v.startY, null, o)), y.push(v)
        }, this.calculate = function() {
            if (0 !== y.length && void 0 !== t && void 0 !== e)
                for (n = 0; v > n; n++) {
                    if (0 === y.length) return;
                    if (l && (n = 0), 0 !== y[0].openList.size()) {
                        var i = y[0].openList.pop();
                        if (y[0].endX === i.x && y[0].endY === i.y) {
                            y[0].isDoneCalculating = !0;
                            var r = [];
                            r.push({
                                x: i.x,
                                y: i.y
                            });
                            for (var s = i.parent; null != s;) r.push({
                                x: s.x,
                                y: s.y
                            }), s = s.parent;
                            r.reverse();
                            var u = y[0],
                                h = r;
                            return void u.callback(h)
                        }
                        var p = [];
                        i.list = a, i.y > 0 && p.push({
                            instance: y[0],
                            searchNode: i,
                            x: 0,
                            y: -1,
                            cost: o * m(i.x, i.y - 1)
                        }), i.x < t[0].length - 1 && p.push({
                            instance: y[0],
                            searchNode: i,
                            x: 1,
                            y: 0,
                            cost: o * m(i.x + 1, i.y)
                        }), i.y < t.length - 1 && p.push({
                            instance: y[0],
                            searchNode: i,
                            x: 0,
                            y: 1,
                            cost: o * m(i.x, i.y + 1)
                        }), i.x > 0 && p.push({
                            instance: y[0],
                            searchNode: i,
                            x: -1,
                            y: 0,
                            cost: o * m(i.x - 1, i.y)
                        }), g && (i.x > 0 && i.y > 0 && (d || b(t, e, i.x, i.y - 1) && b(t, e, i.x - 1, i.y)) && p.push({
                            instance: y[0],
                            searchNode: i,
                            x: -1,
                            y: -1,
                            cost: c * m(i.x - 1, i.y - 1)
                        }), i.x < t[0].length - 1 && i.y < t.length - 1 && (d || b(t, e, i.x, i.y + 1) && b(t, e, i.x + 1, i.y)) && p.push({
                            instance: y[0],
                            searchNode: i,
                            x: 1,
                            y: 1,
                            cost: c * m(i.x + 1, i.y + 1)
                        }), i.x < t[0].length - 1 && i.y > 0 && (d || b(t, e, i.x, i.y - 1) && b(t, e, i.x + 1, i.y)) && p.push({
                            instance: y[0],
                            searchNode: i,
                            x: 1,
                            y: -1,
                            cost: c * m(i.x + 1, i.y - 1)
                        }), i.x > 0 && i.y < t.length - 1 && (d || b(t, e, i.x, i.y + 1) && b(t, e, i.x - 1, i.y)) && p.push({
                            instance: y[0],
                            searchNode: i,
                            x: -1,
                            y: 1,
                            cost: c * m(i.x - 1, i.y + 1)
                        }));
                        for (var f = !1, A = 0; A < p.length; A++)
                            if (x(p[A].instance, p[A].searchNode, p[A].x, p[A].y, p[A].cost), p[A].instance.isDoneCalculating === !0) {
                                f = !0;
                                break
                            }
                        f && y.shift()
                    } else {
                        var u = y[0];
                        u.callback(null), y.shift()
                    }
                }
        };
        var x = function(n, o, i, r, s) {
                var a = o.x + i,
                    c = o.y + r;
                if (void 0 === h[a + "_" + c] && b(t, e, a, c)) {
                    var l = A(n, a, c, o, s);
                    void 0 === l.list ? (l.list = u, n.openList.push(l)) : o.costSoFar + s < l.costSoFar && (l.costSoFar = o.costSoFar + s, l.parent = o, n.openList.updateItem(l))
                }
            },
            b = function(t, n, e, o) {
                for (var i = 0; i < n.length; i++)
                    if (t[o][e] === n[i]) return !0;
                return !1
            },
            m = function(n, e) {
                return f[n + "_" + e] || p[t[e][n]]
            },
            A = function(t, n, e, o, i) {
                if (void 0 !== t.nodeHash[n + "_" + e]) return t.nodeHash[n + "_" + e];
                var s = w(n, e, t.endX, t.endY);
                if (null !== o) var a = o.costSoFar + i;
                else a = 0;
                var u = new r(o, n, e, a, s);
                return t.nodeHash[n + "_" + e] = u, u
            },
            w = function(t, n, e, o) {
                if (g) {
                    var i = Math.abs(t - e),
                        r = Math.abs(n - o);
                    return r > i ? c * i + r : c * r + i
                }
                var i = Math.abs(t - e),
                    r = Math.abs(n - o);
                return i + r
            }
    }
}, function(t, n) {
    t.exports = function() {
        this.isDoneCalculating = !0, this.pointsToAvoid = {}, this.startX, this.callback, this.startY, this.endX, this.endY, this.nodeHash = {}, this.openList
    }
}, function(t, n) {
    t.exports = function(t, n, e, o, i) {
        this.parent = t, this.x = n, this.y = e, this.costSoFar = o, this.simpleDistanceToTarget = i, this.bestGuessDistance = function() {
            return this.costSoFar + this.simpleDistanceToTarget
        }
    }
}, function(t, n, e) {
    t.exports = e(4)
}, function(t, n, e) {
    var o, i, r;
    (function() {
        var e, s, a, u, c, l, h, p, f, d, y, v, g, x, b;
        a = Math.floor, d = Math.min, s = function(t, n) {
            return n > t ? -1 : t > n ? 1 : 0
        }, f = function(t, n, e, o, i) {
            var r;
            if (null == e && (e = 0), null == i && (i = s), 0 > e) throw new Error("lo must be non-negative");
            for (null == o && (o = t.length); o > e;) r = a((e + o) / 2), i(n, t[r]) < 0 ? o = r : e = r + 1;
            return [].splice.apply(t, [e, e - e].concat(n)), n
        }, l = function(t, n, e) {
            return null == e && (e = s), t.push(n), x(t, 0, t.length - 1, e)
        }, c = function(t, n) {
            var e, o;
            return null == n && (n = s), e = t.pop(), t.length ? (o = t[0], t[0] = e, b(t, 0, n)) : o = e, o
        }, p = function(t, n, e) {
            var o;
            return null == e && (e = s), o = t[0], t[0] = n, b(t, 0, e), o
        }, h = function(t, n, e) {
            var o;
            return null == e && (e = s), t.length && e(t[0], n) < 0 && (o = [t[0], n], n = o[0], t[0] = o[1], b(t, 0, e)), n
        }, u = function(t, n) {
            var e, o, i, r, u, c;
            for (null == n && (n = s), r = function() {
                c = [];
                for (var n = 0, e = a(t.length / 2); e >= 0 ? e > n : n > e; e >= 0 ? n++ : n--) c.push(n);
                return c
            }.apply(this).reverse(), u = [], o = 0, i = r.length; i > o; o++) e = r[o], u.push(b(t, e, n));
            return u
        }, g = function(t, n, e) {
            var o;
            return null == e && (e = s), o = t.indexOf(n), -1 !== o ? (x(t, 0, o, e), b(t, o, e)) : void 0
        }, y = function(t, n, e) {
            var o, i, r, a, c;
            if (null == e && (e = s), i = t.slice(0, n), !i.length) return i;
            for (u(i, e), c = t.slice(n), r = 0, a = c.length; a > r; r++) o = c[r], h(i, o, e);
            return i.sort(e).reverse()
        }, v = function(t, n, e) {
            var o, i, r, a, l, h, p, y, v, g;
            if (null == e && (e = s), 10 * n <= t.length) {
                if (a = t.slice(0, n).sort(e), !a.length) return a;
                for (r = a[a.length - 1], y = t.slice(n), l = 0, p = y.length; p > l; l++) o = y[l], e(o, r) < 0 && (f(a, o, 0, null, e), a.pop(), r = a[a.length - 1]);
                return a
            }
            for (u(t, e), g = [], i = h = 0, v = d(n, t.length); v >= 0 ? v > h : h > v; i = v >= 0 ? ++h : --h) g.push(c(t, e));
            return g
        }, x = function(t, n, e, o) {
            var i, r, a;
            for (null == o && (o = s), i = t[e]; e > n && (a = e - 1 >> 1, r = t[a], o(i, r) < 0);) t[e] = r, e = a;
            return t[e] = i
        }, b = function(t, n, e) {
            var o, i, r, a, u;
            for (null == e && (e = s), i = t.length, u = n, r = t[n], o = 2 * n + 1; i > o;) a = o + 1, i > a && !(e(t[o], t[a]) < 0) && (o = a), t[n] = t[o], n = o, o = 2 * n + 1;
            return t[n] = r, x(t, u, n, e)
        }, e = function() {
            function t(t) {
                this.cmp = null != t ? t : s, this.nodes = []
            }
            return t.push = l, t.pop = c, t.replace = p, t.pushpop = h, t.heapify = u, t.updateItem = g, t.nlargest = y, t.nsmallest = v, t.prototype.push = function(t) {
                return l(this.nodes, t, this.cmp)
            }, t.prototype.pop = function() {
                return c(this.nodes, this.cmp)
            }, t.prototype.peek = function() {
                return this.nodes[0]
            }, t.prototype.contains = function(t) {
                return -1 !== this.nodes.indexOf(t)
            }, t.prototype.replace = function(t) {
                return p(this.nodes, t, this.cmp)
            }, t.prototype.pushpop = function(t) {
                return h(this.nodes, t, this.cmp)
            }, t.prototype.heapify = function() {
                return u(this.nodes, this.cmp)
            }, t.prototype.updateItem = function(t) {
                return g(this.nodes, t, this.cmp)
            }, t.prototype.clear = function() {
                return this.nodes = []
            }, t.prototype.empty = function() {
                return 0 === this.nodes.length
            }, t.prototype.size = function() {
                return this.nodes.length
            }, t.prototype.clone = function() {
                var n;
                return n = new t, n.nodes = this.nodes.slice(0), n
            }, t.prototype.toArray = function() {
                return this.nodes.slice(0)
            }, t.prototype.insert = t.prototype.push, t.prototype.top = t.prototype.peek, t.prototype.front = t.prototype.peek, t.prototype.has = t.prototype.contains, t.prototype.copy = t.prototype.clone, t
        }(),
            function(e, s) {
                return i = [], o = s, r = "function" == typeof o ? o.apply(n, i) : o, !(void 0 !== r && (t.exports = r))
            }(this, function() {
                return e
            })
    }).call(this)
}]);


requirejs && define([], function () {
    return EasyStar;
});
