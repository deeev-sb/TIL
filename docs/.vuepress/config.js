const sidebar = require('./sidebar-generator');

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
            sidebar.getSidebarGroup('git-posting', 'Git'),
            sidebar.getSidebarGroup('springBasic', '[강의] 스프링 핵심 원리 - 기본편'),
            sidebar.getSidebarGroup('http-web-network', '[강의] 모든 개발자를 위한 HTTP 웹 기본 지식'),
            sidebar.getSidebarGroup('springInAction', '[책] 스프링 인 액션'),
            sidebar.getSidebarGroup('java-posting', 'Java'),
            sidebar.getSidebarGroup('java8', '[강의] 더 자바, Java 8'),
            sidebar.getSidebarGroup('elastic-stack-posting', 'Elastic Stack'),
            sidebar.getSidebarGroup('analyze-data-with-elk-stack', '[강의] ELK 스택으로 데이터 분석 (7.10.2 ver)'),
            sidebar.getSidebarGroup('elastic-stack', '[책] Elastic Stack 개발부터 운영까지'),
            sidebar.getSidebarGroup('docker&k8s', '[책] 그림과 실습으로 배우는 도커 & 쿠버네티스'),
            sidebar.getSidebarGroup('do-it-algorithm-coding-test-with-java', '[책] Do it! 알고리즘 코딩 테스트 - 자바편'),
            sidebar.getSidebarGroup('linux-posting', 'Linux'),
        ],
    }

};
