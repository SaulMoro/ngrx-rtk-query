(self.webpackChunkngrx_rtk_query_app=self.webpackChunkngrx_rtk_query_app||[]).push([[779],{8779:(e,n,r)=>{"use strict";r.r(n),r.d(n,{PaginationModule:()=>D});var t=r(1116),a=r(4887),c=r(1681),i=r(3350),s=r(7526),o=r(7895),u=r(5366);const g=(0,o.LC)({reducerPath:"rickMortyApi",baseQuery:(0,s.ni)({baseUrl:"https://rickandmortyapi.com/api/"}),endpoints:e=>({getCharacters:e.query({query:(e=1)=>`character?page=${e}`}),getEpisode:e.query({query:e=>`episode/${e}`})})}),{useGetCharactersQuery:l,useLazyGetEpisodeQuery:d}=g;let p=(()=>{class e{}return e.\u0275fac=function(n){return new(n||e)},e.\u0275mod=u.oAB({type:e}),e.\u0275inj=u.cJS({imports:[[i.Aw.forFeature(g.reducerPath,g.reducer,{metaReducers:[g.metareducer]})]]}),e})();const f=function(){return["./"]},m=function(){return{page:1}};function h(e,n){if(1&e){const e=u.EpF();u.TgZ(0,"a",11),u.NdJ("click",function(){return u.CHM(e),u.oxw(2).onPageSelect(1)}),u._uU(1," 1 "),u.qZA()}2&e&&u.Q6J("routerLink",u.DdM(2,f))("queryParams",u.DdM(3,m))}const y=function(){return{page:2}};function x(e,n){if(1&e){const e=u.EpF();u.TgZ(0,"a",11),u.NdJ("click",function(){return u.CHM(e),u.oxw(2).onPageSelect(2)}),u._uU(1," 2 "),u.qZA()}2&e&&u.Q6J("routerLink",u.DdM(2,f))("queryParams",u.DdM(3,y))}function Z(e,n){1&e&&(u.TgZ(0,"span",12),u._uU(1," ... "),u.qZA())}const q=function(e){return{page:e}};function P(e,n){if(1&e){const e=u.EpF();u.TgZ(0,"a",11),u.NdJ("click",function(){u.CHM(e);const n=u.oxw(2);return n.onPageSelect(n.currentPage-1)}),u._uU(1),u.qZA()}if(2&e){const e=u.oxw(2);u.Q6J("routerLink",u.DdM(3,f))("queryParams",u.VKq(4,q,e.currentPage-1)),u.xp6(1),u.hij(" ",e.currentPage-1," ")}}function k(e,n){if(1&e){const e=u.EpF();u.TgZ(0,"a",11),u.NdJ("click",function(){u.CHM(e);const n=u.oxw(2);return n.onPageSelect(n.currentPage+1)}),u._uU(1),u.qZA()}if(2&e){const e=u.oxw(2);u.Q6J("routerLink",u.DdM(3,f))("queryParams",u.VKq(4,q,e.currentPage+1)),u.xp6(1),u.hij(" ",e.currentPage+1," ")}}function w(e,n){1&e&&(u.TgZ(0,"span",12),u._uU(1," ... "),u.qZA())}function b(e,n){if(1&e){const e=u.EpF();u.TgZ(0,"a",11),u.NdJ("click",function(){u.CHM(e);const n=u.oxw(2);return n.onPageSelect(n.pages-1)}),u._uU(1),u.qZA()}if(2&e){const e=u.oxw(2);u.Q6J("routerLink",u.DdM(3,f))("queryParams",u.VKq(4,q,e.pages-1)),u.xp6(1),u.hij(" ",e.pages-1," ")}}function A(e,n){if(1&e){const e=u.EpF();u.TgZ(0,"a",11),u.NdJ("click",function(){u.CHM(e);const n=u.oxw(2);return n.onPageSelect(n.pages)}),u._uU(1),u.qZA()}if(2&e){const e=u.oxw(2);u.Q6J("routerLink",u.DdM(3,f))("queryParams",u.VKq(4,q,e.pages)),u.xp6(1),u.hij(" ",e.pages," ")}}function J(e,n){if(1&e){const e=u.EpF();u.ynx(0),u.TgZ(1,"div",1),u.TgZ(2,"button",2),u.NdJ("click",function(){u.CHM(e);const n=u.oxw();return n.onPageSelect(n.currentPage-1)}),u.O4$(),u.TgZ(3,"svg",3),u._UZ(4,"polyline",4),u.qZA(),u.qZA(),u.kcU(),u.TgZ(5,"div",5),u.YNc(6,h,2,4,"a",6),u.YNc(7,x,2,4,"a",6),u.YNc(8,Z,2,0,"span",7),u.YNc(9,P,2,6,"a",6),u.TgZ(10,"a",8),u._uU(11),u.qZA(),u.YNc(12,k,2,6,"a",6),u.YNc(13,w,2,0,"span",7),u.YNc(14,b,2,6,"a",6),u.YNc(15,A,2,6,"a",6),u.qZA(),u.TgZ(16,"button",9),u.NdJ("click",function(){u.CHM(e);const n=u.oxw();return n.onPageSelect(n.currentPage+1)}),u.O4$(),u.TgZ(17,"svg",3),u._UZ(18,"polyline",10),u.qZA(),u.qZA(),u.qZA(),u.BQk()}if(2&e){const e=u.oxw();u.xp6(2),u.Q6J("ngClass",1===e.currentPage?"opacity-50 cursor-not-allowed":"hover:bg-gray-300")("disabled",1===e.currentPage)("routerLink",u.DdM(19,f))("queryParams",u.VKq(20,q,e.currentPage-1)),u.xp6(4),u.Q6J("ngIf",e.currentPage>2),u.xp6(1),u.Q6J("ngIf",e.currentPage>3),u.xp6(1),u.Q6J("ngIf",e.currentPage>4),u.xp6(1),u.Q6J("ngIf",e.currentPage-1>=1),u.xp6(1),u.Q6J("routerLink",u.DdM(22,f))("queryParams",u.VKq(23,q,e.currentPage)),u.xp6(1),u.hij(" ",e.currentPage," "),u.xp6(1),u.Q6J("ngIf",e.currentPage<e.pages),u.xp6(1),u.Q6J("ngIf",e.currentPage+3<e.pages),u.xp6(1),u.Q6J("ngIf",e.currentPage+2<e.pages),u.xp6(1),u.Q6J("ngIf",e.currentPage+1<e.pages),u.xp6(1),u.Q6J("ngClass",e.currentPage===+e.pages?"opacity-50 cursor-not-allowed":"hover:bg-gray-300")("disabled",e.currentPage===+e.pages)("routerLink",u.DdM(25,f))("queryParams",u.VKq(26,q,e.currentPage+1))}}let v=(()=>{class e{constructor(){this.currentPage=0,this.pages=0,this.page=new u.vpe}onPageSelect(e){this.page.emit(e)}trackByFn(e){return e}}return e.\u0275fac=function(n){return new(n||e)},e.\u0275cmp=u.Xpm({type:e,selectors:[["app-paginator"]],inputs:{currentPage:"currentPage",pages:"pages"},outputs:{page:"page"},decls:1,vars:1,consts:[[4,"ngIf"],[1,"flex","text-gray-700"],["queryParamsHandling","merge",1,"flex","items-center","justify-center","w-12","h-12","mr-1","transition-colors","duration-200","bg-gray-200","rounded-full",3,"ngClass","disabled","routerLink","queryParams","click"],["xmlns","http://www.w3.org/2000/svg","fill","none","viewBox","0 0 24 24","stroke","currentColor","stroke-width","2","stroke-linecap","round","stroke-linejoin","round",1,"w-8"],["points","15 18 9 12 15 6"],[1,"flex","h-12","font-medium","bg-gray-200","rounded-full"],["class","items-center justify-center hidden w-12 leading-5 transition duration-200 ease-in rounded-full md:flex hover:bg-indigo-300","queryParamsHandling","merge",3,"routerLink","queryParams","click",4,"ngIf"],["class","items-center justify-center hidden w-12 leading-5 transition duration-200 ease-in rounded-full md:flex",4,"ngIf"],["queryParamsHandling","merge",1,"items-center","justify-center","hidden","w-12","leading-5","transition","duration-200","ease-in","bg-indigo-500","rounded-full","md:flex",3,"routerLink","queryParams"],["queryParamsHandling","merge",1,"flex","items-center","justify-center","w-12","h-12","ml-1","transition-colors","duration-200","bg-gray-200","rounded-full",3,"ngClass","disabled","routerLink","queryParams","click"],["points","9 18 15 12 9 6"],["queryParamsHandling","merge",1,"items-center","justify-center","hidden","w-12","leading-5","transition","duration-200","ease-in","rounded-full","md:flex","hover:bg-indigo-300",3,"routerLink","queryParams","click"],[1,"items-center","justify-center","hidden","w-12","leading-5","transition","duration-200","ease-in","rounded-full","md:flex"]],template:function(e,n){1&e&&u.YNc(0,J,19,28,"ng-container",0),2&e&&u.Q6J("ngIf",n.currentPage&&n.pages&&n.pages>1)},directives:[t.O5,t.mk,a.rH,a.yS],encapsulation:2,changeDetection:0}),e})();var Q=function(e){return e.alive="alive",e.dead="dead",e.unknown="unknown",e}({});function T(e,n){1&e&&u._UZ(0,"div",13)}function _(e,n){if(1&e&&(u.TgZ(0,"span",9),u._uU(1),u.qZA()),2&e){const e=u.oxw().ngIf;u.xp6(1),u.hij(" ",null==e.data?null:e.data.name," ")}}function I(e,n){if(1&e&&(u.TgZ(0,"div",8),u._uU(1," First seen: "),u.YNc(2,T,1,0,"div",11),u.YNc(3,_,2,1,"ng-template",null,12,u.W1O),u.qZA()),2&e){const e=n.ngIf,r=u.MAs(4);u.xp6(2),u.Q6J("ngIf",e.isLoading)("ngIfElse",r)}}let U=(()=>{class e{constructor(){this.episodeQuery=d(),this.statusTypes=Q}ngOnInit(){this.episodeQuery.fetch(+this.character.episode[0].split("episode/")[1],{preferCacheValue:!0})}}return e.\u0275fac=function(n){return new(n||e)},e.\u0275cmp=u.Xpm({type:e,selectors:[["app-character-card"]],inputs:{character:"character"},decls:17,vars:11,consts:[[1,"flex","flex-col","items-center","justify-center","h-full","p-4","transition-colors","duration-200","bg-white","rounded-lg","shadow","hover:bg-gray-100"],[1,"inline-flex","w-40","h-40","overflow-hidden","border","border-gray-200","rounded-full","shadow-lg","dark:border-gray-800"],[1,"w-full","h-full",3,"src","alt"],[1,"mt-4","text-xl","font-bold"],[1,"mt-1","text-sm","font-medium"],[1,"flex","items-center","mt-1","space-x-2"],[1,"w-3","h-3","rounded-full","shadow",3,"ngClass"],[1,"text-sm","font-medium"],[1,"self-start","mt-3","text-xs","text-gray-500","dark:text-gray-400"],[1,"inline-block","text-indigo-700","hover:text-indigo-800"],["class","self-start mt-3 text-xs text-gray-500 dark:text-gray-400",4,"ngIf"],["class","inline-block w-32 h-4 ml-1 bg-indigo-200 rounded animate-pulse",4,"ngIf","ngIfElse"],["episodeName",""],[1,"inline-block","w-32","h-4","ml-1","bg-indigo-200","rounded","animate-pulse"]],template:function(e,n){1&e&&(u.TgZ(0,"div",0),u.TgZ(1,"div",1),u._UZ(2,"img",2),u.qZA(),u.TgZ(3,"h2",3),u._uU(4),u.qZA(),u.TgZ(5,"h6",4),u._uU(6),u.qZA(),u.TgZ(7,"div",5),u._UZ(8,"span",6),u.TgZ(9,"h6",7),u._uU(10),u.qZA(),u.qZA(),u.TgZ(11,"p",8),u._uU(12," Last known location: "),u.TgZ(13,"span",9),u._uU(14),u.qZA(),u.qZA(),u.YNc(15,I,5,2,"div",10),u.ALo(16,"async"),u.qZA()),2&e&&(u.xp6(2),u.Q6J("src",n.character.image,u.LSH)("alt",n.character.name),u.xp6(2),u.Oqu(n.character.name),u.xp6(2),u.AsE("",n.character.species," - ",n.character.gender,""),u.xp6(2),u.Q6J("ngClass",n.character.status.toLowerCase()===n.statusTypes.dead?"bg-red-400":n.character.status.toLowerCase()===n.statusTypes.alive?"bg-green-400":"bg-gray-400"),u.xp6(2),u.Oqu(n.character.status),u.xp6(4),u.Oqu(null==n.character.location?null:n.character.location.name),u.xp6(1),u.Q6J("ngIf",u.lcZ(16,9,n.episodeQuery.state$)))},directives:[t.mk,t.O5],pipes:[t.Ov],encapsulation:2,changeDetection:0}),e})();function L(e,n){if(1&e&&(u.TgZ(0,"pre"),u._uU(1),u.ALo(2,"json"),u.qZA()),2&e){const e=u.oxw().ngIf;u.xp6(1),u.Oqu(u.lcZ(2,1,e.error))}}function N(e,n){1&e&&u._UZ(0,"app-character-card",10),2&e&&u.Q6J("character",n.$implicit)}function C(e,n){if(1&e&&(u.TgZ(0,"div",8),u.YNc(1,N,1,1,"app-character-card",9),u.qZA()),2&e){const e=n.ngIf,r=u.oxw(2);u.xp6(1),u.Q6J("ngForOf",e)("ngForTrackBy",r.trackByFn)}}const M=function(){return["./"]},j=function(){return{page:999}};function F(e,n){if(1&e&&(u.TgZ(0,"section",1),u.TgZ(1,"div",2),u.TgZ(2,"button",3),u.NdJ("click",function(){return n.ngIf.refetch()}),u._uU(3),u.qZA(),u.TgZ(4,"div"),u._UZ(5,"app-paginator",4),u.qZA(),u.TgZ(6,"button",5),u._uU(7," Nav to bad page "),u.qZA(),u.qZA(),u.YNc(8,L,3,3,"pre",6),u.YNc(9,C,2,2,"div",7),u.qZA()),2&e){const e=n.ngIf;u.xp6(2),u.Q6J("disabled",e.isFetching),u.xp6(1),u.hij(" ",e.isFetching?"Fetching...":"Refresh"," "),u.xp6(2),u.Q6J("currentPage",e.originalArgs||1)("pages",null==e.data||null==e.data.info?null:e.data.info.pages),u.xp6(1),u.Q6J("disabled",e.isLoading)("routerLink",u.DdM(9,M))("queryParams",u.DdM(10,j)),u.xp6(2),u.Q6J("ngIf",e.isError),u.xp6(1),u.Q6J("ngIf",null==e.data?null:e.data.results)}}const H=[{path:"",component:(()=>{class e{constructor(e){this.route=e,this.charactersQuery$=l(this.route.queryParams.pipe((0,c.U)(e=>+(null==e?void 0:e.page)||1)))}trackByFn(e,n){return n.id}}return e.\u0275fac=function(n){return new(n||e)(u.Y36(a.gz))},e.\u0275cmp=u.Xpm({type:e,selectors:[["ng-component"]],decls:2,vars:3,consts:[["class","space-y-4",4,"ngIf"],[1,"space-y-4"],[1,"flex","items-center","justify-between"],[1,"w-32","btn-outline","btn-primary",3,"disabled","click"],[3,"currentPage","pages"],["queryParamsHandling","merge",1,"btn-outline","btn-primary",3,"disabled","routerLink","queryParams"],[4,"ngIf"],["class","grid gap-4 sm:grid-cols-2 lg:grid-cols-3",4,"ngIf"],[1,"grid","gap-4","sm:grid-cols-2","lg:grid-cols-3"],[3,"character",4,"ngFor","ngForOf","ngForTrackBy"],[3,"character"]],template:function(e,n){1&e&&(u.YNc(0,F,10,11,"section",0),u.ALo(1,"async")),2&e&&u.Q6J("ngIf",u.lcZ(1,1,n.charactersQuery$))},directives:[t.O5,v,a.rH,t.sg,U],pipes:[t.Ov,t.Ts],encapsulation:2,changeDetection:0}),e})()}];let Y=(()=>{class e{}return e.\u0275fac=function(n){return new(n||e)},e.\u0275mod=u.oAB({type:e}),e.\u0275inj=u.cJS({imports:[[a.Bz.forChild(H)],a.Bz]}),e})(),D=(()=>{class e{}return e.\u0275fac=function(n){return new(n||e)},e.\u0275mod=u.oAB({type:e}),e.\u0275inj=u.cJS({imports:[[t.ez,Y,p]]}),e})()}}]);