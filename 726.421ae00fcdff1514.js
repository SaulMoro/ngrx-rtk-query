"use strict";(self.webpackChunkngrx_rtk_query_app=self.webpackChunkngrx_rtk_query_app||[]).push([[726],{4726:(B,c,i)=>{i.r(c),i.d(c,{SkipModule:()=>x});var a=i(6895),u=i(9653),m=i(5091),n=i(4650);const r=(0,m.LC)({reducerPath:"pokemonApi",baseQuery:(0,m.ni)({baseUrl:"https://pokeapi.co/api/v2/"}),endpoints:e=>({getPokemonByName:e.query({queryFn:o=>({data:null}),keepUnusedDataFor:1})})});let g=(()=>{class e{}return e.\u0275fac=function(t){return new(t||e)},e.\u0275mod=n.oAB({type:e}),e.\u0275inj=n.cJS({imports:[u.Aw.forFeature(r.reducerPath,r.reducer,{metaReducers:[r.metareducer]})]}),e})();var l=i(5737),h=i(2520),p=i(1135),k=i(4004);function d(e,o){1&e&&n.GkF(0)}let f=(()=>{class e{constructor(){this.nameBehavior=new p.X(this.name),this.name$=this.nameBehavior.asObservable(),this.skipBehavior=new p.X(!1),this.skip$=this.skipBehavior.asObservable(),this.options$=this.skip$.pipe((0,k.U)(t=>({skip:t}))),this.query$=r.endpoints.getPokemonByName.useQuery(this.name$,this.options$)}ngOnInit(){this.intervalId=setInterval(()=>this.skipBehavior?.next(!this.skipBehavior.value),10)}ngOnChanges(t){this.nameBehavior.next(t.name.currentValue)}ngOnDestroy(){clearInterval(this.intervalId)}}return e.\u0275fac=function(t){return new(t||e)},e.\u0275cmp=n.Xpm({type:e,selectors:[["app-pokemon"]],inputs:{name:"name"},features:[n.TTD],decls:2,vars:3,consts:[[4,"ngIf"]],template:function(t,s){1&t&&(n.YNc(0,d,1,0,"ng-container",0),n.ALo(1,"async")),2&t&&n.Q6J("ngIf",n.lcZ(1,1,s.query$))},dependencies:[a.O5,a.Ov],encapsulation:2,changeDetection:0}),e})();function v(e,o){if(1&e&&n._UZ(0,"app-pokemon",5),2&e){const t=n.oxw().ngIf;n.Q6J("name",t)}}function y(e,o){if(1&e&&(n.ynx(0),n.YNc(1,v,1,1,"app-pokemon",4),n.BQk()),2&e){const t=n.oxw();n.xp6(1),n.Q6J("ngIf",t.running)}}function C(e,o){if(1&e&&(n.TgZ(0,"div",6)(1,"h3"),n._uU(2),n.qZA(),n.TgZ(3,"pre"),n._uU(4),n.ALo(5,"json"),n.qZA()()),2&e){const t=o.ngIf,s=n.oxw();n.xp6(2),n.hij("Subscriptions (",s.getSubscriptionsLength(t),"):"),n.xp6(2),n.Oqu(n.lcZ(5,2,t))}}const I=[{path:"",component:(()=>{class e{constructor(){this.store=(0,n.f3M)(u.yh),this.subscriptions$=this.store.select(t=>t.pokemonApi?.subscriptions),this.nameBehavior=new p.X((0,h.x0)()),this.name$=this.nameBehavior.asObservable(),this.running=!1}getSubscriptionsLength(t){return Object.keys(t).length}setRunning(){this.running=!this.running,this.running?this.queryIntervalId=setInterval(()=>this.nameBehavior.next((0,h.x0)())):clearInterval(this.queryIntervalId)}ngOnDestroy(){clearInterval(this.queryIntervalId)}}return e.\u0275fac=function(t){return new(t||e)},e.\u0275cmp=n.Xpm({type:e,selectors:[["app-skip-container"]],decls:7,vars:7,consts:[[1,"space-y-2"],[1,"btn-outline","btn-primary",3,"click"],[4,"ngIf"],["class","space-y-4",4,"ngIf"],[3,"name",4,"ngIf"],[3,"name"],[1,"space-y-4"]],template:function(t,s){1&t&&(n.TgZ(0,"section",0)(1,"button",1),n.NdJ("click",function(){return s.setRunning()}),n._uU(2),n.qZA(),n.YNc(3,y,2,1,"ng-container",2),n.ALo(4,"async"),n.YNc(5,C,6,4,"div",3),n.ALo(6,"async"),n.qZA()),2&t&&(n.xp6(2),n.hij(" ",s.running?"Unmount":"Mount"," "),n.xp6(1),n.Q6J("ngIf",n.lcZ(4,3,s.name$)),n.xp6(2),n.Q6J("ngIf",n.lcZ(6,5,s.subscriptions$)))},dependencies:[a.O5,f,a.Ov,a.Ts],encapsulation:2,changeDetection:0}),e})()}];let S=(()=>{class e{}return e.\u0275fac=function(t){return new(t||e)},e.\u0275mod=n.oAB({type:e}),e.\u0275inj=n.cJS({imports:[l.Bz.forChild(I),l.Bz]}),e})(),x=(()=>{class e{}return e.\u0275fac=function(t){return new(t||e)},e.\u0275mod=n.oAB({type:e}),e.\u0275inj=n.cJS({imports:[a.ez,S,g]}),e})()}}]);