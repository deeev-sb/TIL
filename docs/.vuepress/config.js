const sidebar = require('./auto-sidebar-generator');

module.exports = {
    title: "Subin's TIL",
    description: "Subin's Today I Learned",
    base: "/TIL/",
    head: [
        ["link", {rel: "icon", href: "/images/favicon.png"}]
    ],
    plugins: [
        '@vuepress/back-to-top',
        [
            '@vuepress/last-updated',
            {
                dateOptions:{
                    hour12: false
                }
            }
        ]
    ],
    themeConfig: {
        nav: [
            {text: 'Github', link: 'https://github.com/Kim-SuBin'},
            {text: 'Blog', link: 'https://subin-0320.tistory.com/'}
        ],
        sidebar: [
            sidebar.getSidebarGroup('/git/', 'Git'),
            sidebar.getSidebarGroup('/springBasic/', '[강의] 스프링 핵심 원리 - 기본편'),
            sidebar.getSidebarGroup('/springInAction/', '[책] 스프링 인 액션'),
            sidebar.getSidebarGroup('/java8/', '[강의] 더 자바, Java 8'),
            sidebar.getSidebarGroup('/analyze-data-with-elk-stack/', '[강의] ELK 스택으로 데이터 분석'),
            sidebar.getSidebarGroup('/docker&k8s/', '[책] 그림과 실습으로 배우는 도커 & 쿠버네티스'),
        ]
    }
};
