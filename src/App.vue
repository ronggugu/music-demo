<template>
  <m-header />
  <m-tab />
  <router-view />
</template>

<script>
import MHeader from "@/components/header/header";
import MTab from "@/components/tab/tab";
export default {
  components: {
    MHeader,
    MTab,
  },
  setup() {},
};
</script>

<style lang="scss"></style>
