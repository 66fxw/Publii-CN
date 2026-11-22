<template>
    <div class="screen">
        <div
            v-if="isVisible"
            class="splashscreen">
            <h1 class="title">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 200" xml:space="preserve" role="img" aria-label="Shanhe CMS"><defs><linearGradient id="sh" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2271b1"/><stop offset="1" stop-color="#135e96"/></linearGradient></defs><path fill="url(#sh)" d="M20 150 L70 70 L110 125 L150 55 L200 150 Z" opacity=".9"/><circle cx="180" cy="45" r="16" fill="#f6a623" opacity=".85"/><text x="225" y="105" font-family="PingFang SC, Microsoft YaHei, Segoe UI, sans-serif" font-size="58" font-weight="700" fill="url(#sh)">Shanhe</text><text x="228" y="165" font-family="PingFang SC, Microsoft YaHei, Segoe UI, sans-serif" font-size="34" font-weight="500" fill="#4a5560" letter-spacing="8">CMS</text></svg>
            </h1>

            <small class="version">
                v.{{ version }} (build <span class="splashscreen-build">{{ build }}</span>)
            </small>

            <div
                v-if="appConfigLoaded && !licenseAccepted"
                class="license">
                <p>
                    <span v-pure-html="$t('publii.publiiLicenseAgreementInfo')"></span>
                    <a
                        href="#"
                        @click="showLicense">
                        {{ $t('publii.publiiLicenseAgreement') }}
                    </a>
                </p>

                <p-button
                    :onClick="acceptLicense">
                    {{ $t('publii.accept') }}
                </p-button>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'splashscreen',
    computed: {
        appConfigLoaded () {
            if (!this.$store || !this.$store.state || !this.$store.state.app || !this.$store.state.app.config) {
                return false;
            } 

            let keys = Object.keys(this.$store.state.app.config);

            return keys.length > 0;
        },
        licenseAccepted: function() {
            return this.$store.state.app.config.licenseAccepted;
        },
        // Secondary and reopened windows go straight to the app - unless the license still has to be accepted
        isVisible () {
            return !this.$store.state.app.skipSplashScreen || !this.licenseAccepted;
        },
        version: function() {
            return this.$store.state.app.versionInfo.version;
        },
        build: function() {
            return this.$store.state.app.versionInfo.build;
        }
    },
    methods: {
        showLicense: function(e) {
            e.preventDefault();
            mainProcessAPI.shellOpenExternal('https://github.com/66fxw/Publii-CN/blob/main/LICENSE');
        },
        acceptLicense: function() {
            let self = this;

            mainProcessAPI.send('app-license-accept', true);
            mainProcessAPI.receiveOnce('app-license-accepted', function(data) {
                self.$store.commit('setAppConfig', { licenseAccepted: true });
                self.$bus.$emit('license-accepted');
            });
        }
    },
    beforeDestroy: function() {
        mainProcessAPI.stopReceiveAll('app-license-accepted');
    }
}
</script>

<style scoped>

/*
 * Splashscreen component
 */
.splashscreen {
    left: 50%;
    position: absolute;
    text-align: center;
    top: 50%;
    transform: translateX(-50%) translateY(-50%);
}

.title {
    height: 81px;
    margin: var(--space-6) auto;
    width: 206px;

    img {
        display: block;
        height: 81px;
        width: 206px;
    }
}

.version {
    color: var(--color-text-muted);
    font-size: var(--font-size-ui-md);
    font-weight: var(--font-weight-regular);
}

.license {
    -webkit-app-region: no-drag;
    color: var(--color-text-muted);
    font-weight: var(--font-weight-regular);
    margin-top: 5rem;
}

.accept {
    -webkit-app-region: no-drag;
    font-weight: var(--font-weight-bold);
    height: 3.6rem;
    line-height: 3.4rem;
    margin-top: var(--space-4);
    padding: 0 var(--space-8);
}
</style>
