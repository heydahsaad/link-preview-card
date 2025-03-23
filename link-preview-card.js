/**
 * Copyright 2025 heydahsaad
 * @license Apache-2.0, see LICENSE for full text.
 */
import { LitElement, html, css } from "lit";
import { DDDSuper } from "@haxtheweb/d-d-d/d-d-d.js";
import { I18NMixin } from "@haxtheweb/i18n-manager/lib/I18NMixin.js";

/**
 * `link-preview-card`
 * 
 * @demo index.html
 * @element link-preview-card
 */
export class LinkPreviewCard extends DDDSuper(I18NMixin(LitElement)) {

  static get tag() {
    return "link-preview-card";
  }

  constructor() {
    super();
    this.title = "";
    this.webLink = "";    
    this.imageLink = "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwww.ncenet.com%2Fwp-content%2Fuploads%2F2020%2F04%2Fno-image-png-2.png&f=1&nofb=1&ipt=6684568251b56d8ed89187e9e52fe7e6dfe7e84d19840142bf1d886bce8fedda&ipo=images";
    this.value = null;
    this.loading = false;
    this.logo = "";
    this.themeColor = "";
    this.statusCode = "";


    this.t = this.t || {};
    this.t = {
      ...this.t,
      title: "Title",
    };


    this.registerLocalization({
      context: this,
      localesPath:
        new URL("./locales/link-preview-card.ar.json", import.meta.url).href +
        "/../",
      locales: ["ar", "es", "hi", "zh"],
    });
  }

  // Lit reactive properties
  static get properties() {
    return {
      ...super.properties,
      title: { type: String },
      webLink: { type: String, attribute: "web-link" },
      description: { type: String },
      imageLink: { type: String, attribute: "image-link" },
      themeColor: {type: String},
      logo: {type: String},
      statusCode: {type: String},
    };
  }

  // Lit scoped styles
  static get styles() {
    return [super.styles,
    css`
      :host {
        display: block;
        color: var(--ddd-theme-primary);
        background-color: var(--ddd-theme-accent);
        font-family: var(--ddd-font-navigation);
      }
      .wrapper {
        margin: var(--ddd-spacing-2);
        padding: var(--ddd-spacing-4);
        border-radius: var(--ddd-radius-lg);
        border: var(--ddd-border-md);
        border-color: var(--ddd-theme-default-pughBlue);
        border-width: 8px;
        background-color: var(--ddd-theme-default-potential75);
      }
      h3 span {
        font-size: var(--link-preview-card-label-font-size, var(--ddd-font-size-s));
      }

      img{
          display: block;
          width: 340px;
          /* max-height: 300px; */
          height: auto;
          align-items: center;
          margin: 4px auto;
          padding: 7px;
      }

      .logo{
          display: block;
          width: 100px;
          margin-top: 30px;
      }

      .link{
        list-style: none;
        padding: 8px;
        margin: 10px auto;
        border-radius: var(--ddd-radius-lg);
        display: block;
        background-color: var(--ddd-theme-default-accent);
        color: white ;
        text-align:center;
      }

        .mainTitle{
         color: var(--ddd-theme-default-slateMaxLight);
         background-color: var(--ddd-theme-default-slateGray);
         text-align: center;
         border-radius: var(--ddd-radius-md);
         font-family: Times, Times New Roman, serif;
         margin: var(--ddd-spacing-2);
         padding: var(--ddd-spacing-2);
        }

        tabbed-custom-element::part(tab active) {
            border-color: blue !important;
          }

        details{
          padding: 10px;
          border: 5px solid #f7f7f7;
          border-radius: 3px;
        }

        details:hover{
          cursor:pointer;
        }

        .loader {
          border: 13px solid #f3f3f3; /* Light grey */
          border-top: 13px solid #3498db; /* Blue */
          border-radius: 50%;
          width: 50px;
          height: 50px;
          animation: spin 2s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
    `];
  }

  updated(changedProperties) {
    if (changedProperties.has("webLink")) {
      this.updateResults();
    }
  }

  firstUpdated() {
    this.myFunction(); // Start the loading process
  }

  myFunction(){
    setTimeout(() => {
      this.showPage();
    }, 1000);
  }

  showPage(){
    this.shadowRoot.getElementById("loader").style.display="none";
    this.shadowRoot.getElementById("myDiv").style.display="block";
  }

  

  updateResults() {
    this.loading = true;
    this.errorMessage = ""; // Reset previous errors

    fetch(
      `https://corsproxy.io/?url=https://open-apis.hax.cloud/api/services/website/metadata?q=${this.webLink}`
    )
      .then(response => {
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        return response.json(); // Parse JSON only if response is okay
      })

      .then(response => {
        this.title = response.data["og:title"] || 
                     response.data["title"] || "No Title Found";
        this.description = response.data["og:description"] || response.data["description"] || "No Description Available";
        this.imageLink = response.data["og:image"] || 
                         response.data["ld+json"]?.logo || 
                         response.data["ld+json"]?.publisher?.logo || 
                         response.data["msapplication-TileImage"] ||
                         response.data["apple-touch-icon"] ||
                         "fallback-image.png";
        this.logo = response.data["ld+json"]?.logo || null;
        this.themeColor = response.data["theme-color"] || (response.data["msapplication-TileColor"]) || "No color";

        // Extract domain from webLink
        const url = new URL(this.webLink);
        const domain = url.hostname;

        // Check if it's a PSU domain
        if (response.data["theme-color"]) {
          this.themeColor = response.data["theme-color"];
        } else if (response.data["msapplication-TileColor"]) {
          this.themeColor = response.data["msapplication-TileColor"];
        } else {
          // If no themeColor exists, apply PSU logic or random primary color
          if (domain.endsWith("psu.edu")) {
            this.themeColor = "var(--ddd-primary-2)"; // Nittany Navy
          } else {
            const randomIndex = Math.floor(Math.random() * 26); // Random number between 0 and 25
            this.themeColor = `var(--ddd-primary-${randomIndex})`;
          }
        }
      })

      .catch(error => {
        console.error("Fetch error", error);
        this.errorMessage = "Error";
      })
      .finally(() => {
        this.loading = false; // Ensure loading stops
      });
}



  // Lit render the HTML
  render() {
    return html`
    <div class="loader" id="loader"></div>
      <div class="wrapper" id="myDiv" style="display: none; border-color:${this.themeColor}" >
          <p part="tab active" style="margin: 0px;" class="link">Visit: <a href="${this.webLink}" target="_blank">${this.webLink}</a></p>
          <img
            src="${this.imageLink}"
            alt="${this.t.title}: ${this.title}"
            loading="lazy"
          />
          <h2 class="mainTitle" 
              style="background-color:${this.themeColor}; 
                    color: ${this.themeColor === '#ffffff' ? 'black' : 'white'};">
            ${this.title}
          </h2>
          <details>
            <summary>More details</summary>
            <p style="text-shadow: 2px 0px 6px #000000; padding: 10px;">${this.description}</p>
          </details>
          <!-- <p>Theme color: ${this.themeColor}</p> -->
          <img
            src="${this.logo}"   
            class="logo"     
          />
          <slot></slot>
        </div>
    <!-- <details open></details> -->
    `;
  }

  /**
   * haxProperties integration via file reference
   */
  static get haxProperties() {
    return new URL(`./lib/${this.tag}.haxProperties.json`, import.meta.url)
      .href;
  }
}

globalThis.customElements.define(LinkPreviewCard.tag, LinkPreviewCard);