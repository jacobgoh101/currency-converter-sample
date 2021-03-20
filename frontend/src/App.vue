<template>
  <div class="container">
    <section class="section">
      <div class="columns">
        <div class="column">
          <b-field label="Amount">
            <b-numberinput
              v-model="amount"
              expanded
              min-step="0.01"
            ></b-numberinput>
          </b-field>
        </div>
        <div class="column">
          <b-field label="Source">
            <b-select
              placeholder="Select the source currency"
              v-model="from"
              expanded
            >
              <option
                v-for="option in options"
                :value="option.value"
                :key="option.value"
              >
                {{ option.label }}
              </option>
            </b-select>
          </b-field>
        </div>
        <div class="column">
          <b-field label="Target">
            <b-select
              placeholder="Select the target currency"
              v-model="to"
              expanded
            >
              <option
                v-for="option in options"
                :value="option.value"
                :key="option.value"
              >
                {{ option.label }}
              </option>
            </b-select>
          </b-field>
        </div>
      </div>
    </section>
    <div class="columns" v-if="exchangeRateError">
      <div class="column">
        <b-notification
          type="is-danger"
          aria-close-label="Close notification"
          role="alert"
        >
          {{ exchangeRateError }}
        </b-notification>
      </div>
    </div>
    <section class="section has-text-centered" :class="$style.resultSection">
      <b-loading
        :is-full-page="false"
        v-model="isValidating"
        :can-cancel="true"
      />
      <template v-if="convertedAmount">
        <div class="has-text-5">{{ amount }} {{ from }} = <br /></div>
        <div>
          <span class="is-size-1">{{ formatAmount(convertedAmount) }}</span>
          {{ to }}
        </div>
        <div class="is-size-6">
          1 {{ to }} = {{ formatAmount(1 / rate) }} {{ from }}
        </div>
        <div class="is-size-6">
          1 {{ from }} = {{ formatAmount(rate) }} {{ to }}
        </div>
      </template>
    </section>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from "@vue/composition-api";
import useSWRV from "swrv";
import axios from "axios";

interface Option {
  label: string;
  value: string;
}

interface ExchangeRate {
  from: string;
  to: string;
  rate: number;
}

export default defineComponent({
  setup() {
    const options: Option[] = [
      { label: "USD", value: "USD" },
      { label: "EUR", value: "EUR" },
      { label: "MYR", value: "MYR" },
    ];
    const amount = ref(1);
    const from = ref<Option["value"]>(options[0].value);
    const to = ref<Option["value"]>(options[1].value);

    const {
      data: exchangeRateData,
      error: exchangeRateError,
      isValidating,
    } = useSWRV<ExchangeRate>(
      () => from.value && to.value && [from.value, to.value],
      (f: Option["value"], t: Option["value"]) => {
        return axios
          .get(`http://localhost:3000/exchange-rates?from=${f}&to=${t}`)
          .then((res) => res.data);
      },
      { shouldRetryOnError: false, errorRetryCount: 0 }
    );

    const convertedAmount = computed<number | null>(() => {
      return amount.value && exchangeRateData.value?.rate
        ? amount.value * exchangeRateData.value?.rate
        : null;
    });

    const rate = computed<number | undefined>(() => {
      return exchangeRateData.value?.rate;
    });

    const formatAmount = (num: number) => {
      return num?.toLocaleString("en-US", { maximumFractionDigits: 6 });
    };

    return {
      amount,
      options,
      from,
      to,
      exchangeRateData,
      exchangeRateError,
      convertedAmount,
      isValidating,
      rate,
      formatAmount,
    };
  },
});
</script>

<style lang="scss">
@import "~@mdi/font/css/materialdesignicons.min.css";
</style>

<style lang="scss" module>
.resultSection {
  min-height: 200px;
  position: relative;
}
</style>
