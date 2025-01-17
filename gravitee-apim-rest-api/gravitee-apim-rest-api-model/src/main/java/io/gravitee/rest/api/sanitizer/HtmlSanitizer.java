/*
 * Copyright © 2015 The Gravitee team (http://gravitee.io)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package io.gravitee.rest.api.sanitizer;

import org.owasp.html.HtmlPolicyBuilder;
import org.owasp.html.PolicyFactory;

public final class HtmlSanitizer {

    /**
     * OWASP HTML sanitizer to prevent XSS attacks.
     */
    private static final PolicyFactory HTML_SANITIZER = new HtmlPolicyBuilder().toFactory();

    private static String unSanitizeAllowedChars(String content) {
        if (content == null) {
            return null;
        }

        return content
            .replaceAll("&lt;", "<")
            .replaceAll("&gt;", ">")
            .replaceAll("&amp;", "&")
            .replaceAll("&#34;", "\"")
            .replaceAll("&#39;", "'")
            .replaceAll("&#43;", "+")
            .replaceAll("&#61;", "=")
            .replaceAll("&#96;", "`");
    }

    public static String sanitize(String content) {
        if (content == null) {
            return null;
        }
        return unSanitizeAllowedChars(HTML_SANITIZER.sanitize(unSanitizeAllowedChars(content)));
    }
}
