(self.webpackChunkngrx_rtk_query_app=self.webpackChunkngrx_rtk_query_app||[]).push([[246],{6246:(n,t,e)=>{"use strict";e.r(t),e.d(t,{CounterModule:()=>y});var i=e(1116),c=e(6728),o=e(4887),s=e(1917),l=e(1742),r=e(5366),a=e(7425),u=e(1681);const p=[{value:0,label:"0 - off"},{value:1e3,label:"1s"},{value:3e3,label:"3s"},{value:5e3,label:"5s"},{value:1e4,label:"10s"},{value:6e4,label:"1m"}];function d(n,t){if(1&n){const n=r.EpF();r.TgZ(0,"button",7),r.NdJ("click",function(){return r.CHM(n),r.oxw().incrementCounter()}),r._uU(1," + "),r.qZA()}2&n&&r.Q6J("disabled",t.ngIf.isLoading)}function g(n,t){if(1&n&&(r.TgZ(0,"span",8),r._uU(1),r.qZA()),2&n){const n=t.ngIf;r.ekj("bg-green-100",n.isFetching),r.xp6(1),r.Oqu((null==n.data?null:n.data.count)||0)}}function f(n,t){if(1&n){const n=r.EpF();r.TgZ(0,"button",7),r.NdJ("click",function(){return r.CHM(n),r.oxw().decrementCounter()}),r._uU(1," - "),r.qZA()}2&n&&r.Q6J("disabled",t.ngIf.isLoading)}function Z(n,t){if(1&n&&(r.TgZ(0,"option",9),r._uU(1),r.qZA()),2&n){const n=t.$implicit;r.Q6J("value",n.value),r.xp6(1),r.hij(" ",n.label," ")}}let m=(()=>{class n{constructor(){this.id="",this.pollingOptions=p,this.pollingInterval=new a.X(this.pollingOptions[0].value),this.pollingInterval$=this.pollingInterval.asObservable(),this.options$=this.pollingInterval$.pipe((0,u.U)(n=>({pollingInterval:n}))),this.countQuery=(0,l.v)(this.options$),this.increment=(0,l.k9)(),this.decrement=(0,l.bG)()}ngOnInit(){this.countQuery.fetch(this.id)}changePollingInterval(n){this.pollingInterval.next(+n)}incrementCounter(){this.increment.dispatch({id:this.id,amount:1})}decrementCounter(){this.decrement.dispatch({id:this.id,amount:1})}}return n.\u0275fac=function(t){return new(t||n)},n.\u0275cmp=r.Xpm({type:n,selectors:[["app-counter"]],inputs:{id:"id"},decls:13,vars:14,consts:[[1,"space-y-4"],[1,"font-medium","text-md"],[1,"flex","items-center","space-x-4"],["class","btn-outline btn-primary",3,"disabled","click",4,"ngIf"],["class","text-3xl font-bold",3,"bg-green-100",4,"ngIf"],[3,"ngModel","ngModelChange"],[3,"value",4,"ngFor","ngForOf"],[1,"btn-outline","btn-primary",3,"disabled","click"],[1,"text-3xl","font-bold"],[3,"value"]],template:function(n,t){1&n&&(r.TgZ(0,"section",0),r.TgZ(1,"h1",1),r._uU(2),r.qZA(),r.TgZ(3,"div",2),r.YNc(4,d,2,1,"button",3),r.ALo(5,"async"),r.YNc(6,g,2,3,"span",4),r.ALo(7,"async"),r.YNc(8,f,2,1,"button",3),r.ALo(9,"async"),r.TgZ(10,"select",5),r.NdJ("ngModelChange",function(n){return t.changePollingInterval(n)}),r.ALo(11,"async"),r.YNc(12,Z,2,2,"option",6),r.qZA(),r.qZA(),r.qZA()),2&n&&(r.xp6(2),r.Oqu(t.id),r.xp6(2),r.Q6J("ngIf",r.lcZ(5,6,t.increment.state$)),r.xp6(2),r.Q6J("ngIf",r.lcZ(7,8,t.countQuery.state$)),r.xp6(2),r.Q6J("ngIf",r.lcZ(9,10,t.decrement.state$)),r.xp6(2),r.Q6J("ngModel",r.lcZ(11,12,t.pollingInterval$)),r.xp6(2),r.Q6J("ngForOf",t.pollingOptions))},directives:[i.O5,c.EJ,c.JJ,c.On,i.sg,c.YN,c.Kr],pipes:[i.Ov],encapsulation:2,changeDetection:0}),n})();function b(n,t){if(1&n){const n=r.EpF();r.TgZ(0,"button",11),r.NdJ("click",function(){return r.CHM(n),r.oxw().increment.dispatch(1)}),r._uU(1," + "),r.qZA()}2&n&&r.Q6J("disabled",t.ngIf.isLoading)}function h(n,t){if(1&n&&(r.TgZ(0,"span",12),r._uU(1),r.qZA()),2&n){const n=t.ngIf;r.xp6(1),r.Oqu((null==n.data?null:n.data.count)||0)}}function x(n,t){if(1&n&&(r.TgZ(0,"div",13),r._UZ(1,"app-counter",14),r.qZA()),2&n){const n=t.$implicit;r.xp6(1),r.Q6J("id",n)}}const v=[{path:"",component:(()=>{class n{constructor(){this.countQuery$=(0,l.X2)(),this.increment=(0,l.lE)(),this.decrement=(0,l.pn)(),this.counters=[]}addCounter(){this.counters=[...this.counters,(0,s.x0)()]}trackByFn(n,t){return t}}return n.\u0275fac=function(t){return new(t||n)},n.\u0275cmp=r.Xpm({type:n,selectors:[["app-counter-manager"]],decls:27,vars:13,consts:[[1,"space-y-8"],[1,"space-y-4"],[1,"text-xl","font-semibold"],[1,"flex","items-center","space-x-4"],["class","btn-outline btn-primary",3,"disabled","click",4,"ngIf"],["class","text-3xl font-bold",4,"ngIf"],[1,"btn-outline","btn-primary",3,"click"],[1,"mt-6","text-xs","bg-gray-200"],[1,"flex","items-center","space-x-8"],[1,"btn","btn-primary",3,"click"],["class","w-full mt-6",4,"ngFor","ngForOf","ngForTrackBy"],[1,"btn-outline","btn-primary",3,"disabled","click"],[1,"text-3xl","font-bold"],[1,"w-full","mt-6"],[3,"id"]],template:function(n,t){1&n&&(r.TgZ(0,"div",0),r.TgZ(1,"section",1),r.TgZ(2,"h1",2),r._uU(3,"Main Counter"),r.qZA(),r.TgZ(4,"div"),r.TgZ(5,"div",3),r.YNc(6,b,2,1,"button",4),r.ALo(7,"async"),r.YNc(8,h,2,1,"span",5),r.ALo(9,"async"),r.TgZ(10,"button",6),r.NdJ("click",function(){return t.decrement.dispatch(1)}),r._uU(11,"-"),r.qZA(),r.qZA(),r.TgZ(12,"small"),r._uU(13,"Decrease is a optimistic update!"),r.qZA(),r.TgZ(14,"p",7),r.TgZ(15,"code"),r._uU(16),r.ALo(17,"json"),r.ALo(18,"async"),r.qZA(),r.qZA(),r.qZA(),r.qZA(),r.TgZ(19,"section",1),r._UZ(20,"hr"),r.TgZ(21,"div",8),r.TgZ(22,"h1",2),r._uU(23,"Counters List"),r.qZA(),r.TgZ(24,"button",9),r.NdJ("click",function(){return t.addCounter()}),r._uU(25,"Add individual counter"),r.qZA(),r.qZA(),r.YNc(26,x,2,1,"div",10),r.qZA(),r.qZA()),2&n&&(r.xp6(6),r.Q6J("ngIf",r.lcZ(7,5,t.increment.state$)),r.xp6(2),r.Q6J("ngIf",r.lcZ(9,7,t.countQuery$)),r.xp6(8),r.Oqu(r.lcZ(17,9,r.lcZ(18,11,t.countQuery$))),r.xp6(10),r.Q6J("ngForOf",t.counters)("ngForTrackBy",t.trackByFn))},directives:[i.O5,i.sg,m],pipes:[i.Ov,i.Ts],encapsulation:2,changeDetection:0}),n})()}];let A=(()=>{class n{}return n.\u0275fac=function(t){return new(t||n)},n.\u0275mod=r.oAB({type:n}),n.\u0275inj=r.cJS({imports:[[o.Bz.forChild(v)],o.Bz]}),n})(),y=(()=>{class n{}return n.\u0275fac=function(t){return new(t||n)},n.\u0275mod=r.oAB({type:n}),n.\u0275inj=r.cJS({imports:[[i.ez,A,c.u5]]}),n})()}}]);